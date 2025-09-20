interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
}

export function ProgressIndicator({ currentIndex, total }: ProgressIndicatorProps) {
  return (
    <div className="progress-indicator">
      Карточка {currentIndex + 1} из {total}
    </div>
  );
}
