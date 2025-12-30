import { useState, useEffect } from "react";
import { FilterState } from "./useHistoryFilters";

export interface FilterPreset {
  id: string;
  name: string;
  filters: Omit<FilterState, "page" | "view">;
  createdAt: string;
}

const STORAGE_KEY = "mindful-trader-history-presets";
const MAX_PRESETS = 10;

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      }
    } catch (error) {
      console.error("Failed to load filter presets:", error);
    }
  }, []);

  // Save preset
  const savePreset = (
    name: string,
    filters: Omit<FilterState, "page" | "view">
  ): FilterPreset => {
    // Validate name
    if (!name || name.length < 3 || name.length > 50) {
      throw new Error("Preset name must be between 3 and 50 characters");
    }

    const newPreset: FilterPreset = {
      id: crypto.randomUUID(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    setPresets((prev) => {
      let updated = [newPreset, ...prev];

      // Limit to MAX_PRESETS (remove oldest)
      if (updated.length > MAX_PRESETS) {
        updated = updated.slice(0, MAX_PRESETS);
      }

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save preset:", error);
      }

      return updated;
    });

    return newPreset;
  };

  // Load preset
  const loadPreset = (id: string): FilterPreset | null => {
    const preset = presets.find((p) => p.id === id);
    return preset || null;
  };

  // Delete preset
  const deletePreset = (id: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to delete preset:", error);
      }

      return updated;
    });
  };

  // Update preset (rename)
  const updatePreset = (id: string, name: string) => {
    if (!name || name.length < 3 || name.length > 50) {
      throw new Error("Preset name must be between 3 and 50 characters");
    }

    setPresets((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, name } : p));

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to update preset:", error);
      }

      return updated;
    });
  };

  // Get all presets (sorted by createdAt desc)
  const getPresets = (): FilterPreset[] => {
    return [...presets].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return {
    presets: getPresets(),
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
    canSaveMore: presets.length < MAX_PRESETS,
  };
}
