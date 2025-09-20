"""Views that expose lesson, card and progress APIs."""

from __future__ import annotations

import json
from typing import Any, Dict, Optional

from django.db import models
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .models import Card, Lesson, StudyProgress


def _build_file_url(request: HttpRequest, field) -> Optional[str]:
    """Return an absolute URL for a file/image field if it exists."""

    if not field:
        return None
    url = field.url
    if request is None:
        return url
    return request.build_absolute_uri(url)


def _card_to_dict(card: Card, request: Optional[HttpRequest] = None) -> Dict[str, Any]:
    return {
        "id": card.id,
        "lesson_id": card.lesson_id,
        "english_text": card.english_text,
        "translation": card.translation,
        "order": card.order,
        "image": _build_file_url(request, card.image),
        "audio": _build_file_url(request, card.audio),
    }


def _lesson_to_dict(lesson: Lesson, request: Optional[HttpRequest] = None) -> Dict[str, Any]:
    return {
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.description,
        "total_cards": lesson.total_cards,
        "cover_image": _build_file_url(request, lesson.cover_image),
    }


def _parse_json_body(request: HttpRequest) -> Dict[str, Any]:
    try:
        body = request.body.decode("utf-8") or "{}"
        return json.loads(body)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:  # pragma: no cover - defensive
        raise ValueError("Invalid JSON body") from exc


def _json_error(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"error": message}, status=status)


class LessonListView(View):
    """Public endpoint that lists all lessons with optional progress info for a profile."""

    def get(self, request: HttpRequest) -> JsonResponse:
        profile = request.GET.get("profile")
        lessons = Lesson.objects.all().prefetch_related("cards")

        response = []
        for lesson in lessons:
            data = _lesson_to_dict(lesson, request)
            if profile:
                progress = (
                    StudyProgress.objects.filter(profile=profile, lesson=lesson)
                    .only("current_card_index", "completed", "updated_at")
                    .first()
                )
                data["progress"] = progress.to_dict() if progress else None
            response.append(data)

        return JsonResponse({"lessons": response})


@method_decorator(csrf_exempt, name="dispatch")
class AdminLessonListCreateView(View):
    """Create new lessons or list them for administrative interfaces."""

    def get(self, request: HttpRequest) -> JsonResponse:
        lessons = Lesson.objects.all().prefetch_related("cards")
        return JsonResponse({"lessons": [_lesson_to_dict(lesson, request) for lesson in lessons]})

    def post(self, request: HttpRequest) -> JsonResponse:
        try:
            data = _parse_json_body(request)
        except ValueError:
            return _json_error("Unable to decode JSON payload")

        title = data.get("title")
        if not title:
            return _json_error("'title' is required")

        lesson = Lesson.objects.create(
            title=title,
            description=data.get("description", ""),
        )
        return JsonResponse(_lesson_to_dict(lesson, request), status=201)


@method_decorator(csrf_exempt, name="dispatch")
class AdminLessonDetailView(View):
    """Retrieve, update or delete a single lesson."""

    def get(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        return JsonResponse(_lesson_to_dict(lesson, request))

    def put(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        try:
            data = _parse_json_body(request)
        except ValueError:
            return _json_error("Unable to decode JSON payload")

        title = data.get("title")
        if title:
            lesson.title = title
        if "description" in data:
            lesson.description = data.get("description") or ""
        lesson.save(update_fields=["title", "description", "updated_at"])
        return JsonResponse(_lesson_to_dict(lesson, request))

    def delete(self, request: HttpRequest, lesson_id: int) -> HttpResponse:
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        lesson.delete()
        return HttpResponse(status=204)


@method_decorator(csrf_exempt, name="dispatch")
class AdminCardListCreateView(View):
    """List or create cards inside a lesson."""

    def get(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        cards = lesson.cards.all()
        return JsonResponse({"lesson": _lesson_to_dict(lesson, request), "cards": [_card_to_dict(card, request) for card in cards]})

    def post(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        try:
            data = _parse_json_body(request)
        except ValueError:
            return _json_error("Unable to decode JSON payload")

        english_text = data.get("english_text")
        translation = data.get("translation")
        if not english_text or not translation:
            return _json_error("'english_text' and 'translation' are required fields")

        order = data.get("order")
        if order is None:
            order = (lesson.cards.aggregate(max_order=models.Max("order")))["max_order"] or 0
            order += 1

        card = Card.objects.create(
            lesson=lesson,
            english_text=english_text,
            translation=translation,
            order=order,
        )
        return JsonResponse(_card_to_dict(card, request), status=201)


@method_decorator(csrf_exempt, name="dispatch")
class AdminCardDetailView(View):
    """Retrieve, update or delete a single card."""

    def get(self, request: HttpRequest, card_id: int) -> JsonResponse:
        card = get_object_or_404(Card, pk=card_id)
        return JsonResponse(_card_to_dict(card, request))

    def put(self, request: HttpRequest, card_id: int) -> JsonResponse:
        card = get_object_or_404(Card, pk=card_id)
        try:
            data = _parse_json_body(request)
        except ValueError:
            return _json_error("Unable to decode JSON payload")

        if "english_text" in data:
            card.english_text = data.get("english_text") or card.english_text
        if "translation" in data:
            card.translation = data.get("translation") or card.translation
        if "order" in data and data["order"] is not None:
            card.order = int(data["order"])
        card.save(update_fields=["english_text", "translation", "order", "updated_at"])
        return JsonResponse(_card_to_dict(card, request))

    def delete(self, request: HttpRequest, card_id: int) -> HttpResponse:
        card = get_object_or_404(Card, pk=card_id)
        card.delete()
        return HttpResponse(status=204)


class LessonCardsView(View):
    """Child-facing endpoint to retrieve the cards inside a lesson."""

    def get(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        profile = request.GET.get("profile")
        cards = lesson.cards.all()
        progress_payload: Optional[Dict[str, Any]] = None

        if profile:
            progress, _ = StudyProgress.objects.get_or_create(profile=profile, lesson=lesson)
            progress_payload = progress.to_dict()
            progress_payload["total_cards"] = cards.count()

        return JsonResponse(
            {
                "lesson": _lesson_to_dict(lesson, request),
                "cards": [_card_to_dict(card, request) for card in cards],
                "progress": progress_payload,
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
class StudyProgressView(View):
    """Retrieve or update progress for a profile inside a lesson."""

    def get(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        profile = request.GET.get("profile")
        if not profile:
            return _json_error("'profile' query parameter is required")
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        progress, _ = StudyProgress.objects.get_or_create(profile=profile, lesson=lesson)
        payload = progress.to_dict()
        payload["total_cards"] = lesson.total_cards
        return JsonResponse(payload)

    def post(self, request: HttpRequest, lesson_id: int) -> JsonResponse:
        try:
            data = _parse_json_body(request)
        except ValueError:
            return _json_error("Unable to decode JSON payload")

        profile = data.get("profile")
        if not profile:
            return _json_error("'profile' is required")

        lesson = get_object_or_404(Lesson, pk=lesson_id)
        progress, _ = StudyProgress.objects.get_or_create(profile=profile, lesson=lesson)

        if "current_card_index" in data:
            index = max(0, int(data.get("current_card_index", 0)))
            progress.current_card_index = index
        if "completed" in data:
            progress.completed = bool(data.get("completed"))
        progress.save(update_fields=["current_card_index", "completed", "updated_at"])

        payload = progress.to_dict()
        payload["total_cards"] = lesson.total_cards
        return JsonResponse(payload)
