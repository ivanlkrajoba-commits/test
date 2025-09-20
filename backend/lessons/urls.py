"""URL patterns for lesson, card and progress APIs."""

from django.urls import path

from . import views

urlpatterns = [
    path("lessons/", views.LessonListView.as_view(), name="lesson-list"),
    path("lessons/<int:lesson_id>/cards/", views.LessonCardsView.as_view(), name="lesson-cards"),
    path("lessons/<int:lesson_id>/progress/", views.StudyProgressView.as_view(), name="lesson-progress"),
    path("admin/lessons/", views.AdminLessonListCreateView.as_view(), name="admin-lesson-list"),
    path("admin/lessons/<int:lesson_id>/", views.AdminLessonDetailView.as_view(), name="admin-lesson-detail"),
    path(
        "admin/lessons/<int:lesson_id>/cards/",
        views.AdminCardListCreateView.as_view(),
        name="admin-lesson-card-list",
    ),
    path("admin/cards/<int:card_id>/", views.AdminCardDetailView.as_view(), name="admin-card-detail"),
]
