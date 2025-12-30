import { useEffect } from "react";

export interface KeyboardShortcutsConfig {
  onOpenFilters?: () => void;
  onToggleView?: (view: "list" | "calendar") => void;
  onNavigatePage?: (direction: "prev" | "next") => void;
  onFocusSearch?: () => void;
  onOpenHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const {
    onOpenFilters,
    onToggleView,
    onNavigatePage,
    onFocusSearch,
    onOpenHelp,
    enabled = true,
  } = config;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Handle Cmd/Ctrl + K for search focus
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Skip other shortcuts if input is focused (except Escape and Cmd+K)
      if (isInputFocused && event.key !== "Escape") return;

      switch (event.key.toLowerCase()) {
        case "f":
          event.preventDefault();
          onOpenFilters?.();
          break;

        case "l":
          event.preventDefault();
          onToggleView?.("list");
          break;

        case "c":
          event.preventDefault();
          onToggleView?.("calendar");
          break;

        case "arrowleft":
          if (!isInputFocused) {
            event.preventDefault();
            onNavigatePage?.("prev");
          }
          break;

        case "arrowright":
          if (!isInputFocused) {
            event.preventDefault();
            onNavigatePage?.("next");
          }
          break;

        case "?":
          event.preventDefault();
          onOpenHelp?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    onOpenFilters,
    onToggleView,
    onNavigatePage,
    onFocusSearch,
    onOpenHelp,
  ]);
}
