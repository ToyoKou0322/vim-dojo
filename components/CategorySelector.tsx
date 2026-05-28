"use client";

import { Category, CATEGORIES, CHALLENGES } from "@/lib/challenges";

type FilterCategory = Category | "all";

interface CategorySelectorProps {
  selected: FilterCategory;
  onChange: (cat: FilterCategory) => void;
  completedIds: Set<string>;
}

const ALL_OPTION = { label: "すべて", color: "gray", icon: "⚡" };

export default function CategorySelector({ selected, onChange, completedIds }: CategorySelectorProps) {
  const categories: FilterCategory[] = ["all", "movement", "editing", "mode", "search"];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const info = cat === "all" ? ALL_OPTION : CATEGORIES[cat];
        const total = cat === "all"
          ? CHALLENGES.length
          : CHALLENGES.filter((c) => c.category === cat).length;
        const completed = cat === "all"
          ? completedIds.size
          : CHALLENGES.filter((c) => c.category === cat && completedIds.has(c.id)).length;
        const isSelected = selected === cat;

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSelected
                ? "bg-white text-gray-900 shadow-lg scale-105"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span>{info.icon}</span>
            <span>{info.label}</span>
            <span className={`text-xs ml-1 ${isSelected ? "text-gray-600" : "text-gray-500"}`}>
              {completed}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
