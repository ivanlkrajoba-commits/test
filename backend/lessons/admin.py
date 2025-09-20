from django.contrib import admin

from .models import Card, Lesson, StudyProgress


class CardInline(admin.TabularInline):
    model = Card
    extra = 1
    fields = ("english_text", "translation", "order", "image", "audio")


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "total_cards", "created_at", "updated_at")
    search_fields = ("title",)
    inlines = [CardInline]


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("english_text", "lesson", "order", "created_at")
    list_filter = ("lesson",)
    search_fields = ("english_text", "translation", "lesson__title")
    ordering = ("lesson", "order")


@admin.register(StudyProgress)
class StudyProgressAdmin(admin.ModelAdmin):
    list_display = ("profile", "lesson", "current_card_index", "completed", "updated_at")
    list_filter = ("lesson", "completed")
    search_fields = ("profile", "lesson__title")
