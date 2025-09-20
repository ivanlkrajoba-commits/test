from django.db import models


class Lesson(models.Model):
    """A set of cards that forms a single learning module."""

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(
        upload_to="lessons/covers/", blank=True, null=True, help_text="Lesson cover shown in menus."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self) -> str:  # pragma: no cover - human readable representation
        return self.title

    @property
    def total_cards(self) -> int:
        return self.cards.count()


class Card(models.Model):
    """A single flash card inside a lesson."""

    lesson = models.ForeignKey(Lesson, related_name="cards", on_delete=models.CASCADE)
    english_text = models.CharField(max_length=255)
    translation = models.CharField(max_length=255)
    image = models.ImageField(
        upload_to="cards/images/", blank=True, null=True, help_text="Optional picture for recognition exercises."
    )
    audio = models.FileField(
        upload_to="cards/audio/", blank=True, null=True, help_text="Optional pre-recorded pronunciation audio."
    )
    order = models.PositiveIntegerField(
        default=0, help_text="Controls the order of the card inside the lesson; lower numbers appear first."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:  # pragma: no cover - human readable representation
        return f"{self.english_text} ({self.lesson})"


class StudyProgress(models.Model):
    """Tracks how far a child has progressed within a lesson."""

    profile = models.CharField(
        max_length=255,
        help_text="Identifier for a child profile or device. Can be a username or generated token.",
    )
    lesson = models.ForeignKey(Lesson, related_name="progress_records", on_delete=models.CASCADE)
    current_card_index = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("profile", "lesson")
        verbose_name_plural = "Study progress"

    def __str__(self) -> str:  # pragma: no cover - human readable representation
        return f"{self.profile} – {self.lesson.title}"

    def to_dict(self) -> dict:
        return {
            "profile": self.profile,
            "lesson_id": self.lesson_id,
            "current_card_index": self.current_card_index,
            "completed": self.completed,
            "updated_at": self.updated_at.isoformat(),
        }
