import { useEffect, useState } from "react";

const STORAGE_KEY = "english-learning-profile";

function generateProfileId(): string {
  return `demo-${Math.random().toString(36).slice(2, 10)}`;
}

export function useProfileId(): string {
  const [profileId] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "demo";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const generated = generateProfileId();
    window.localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  });

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.setItem(STORAGE_KEY, profileId);
    }
  }, [profileId]);

  return profileId;
}
