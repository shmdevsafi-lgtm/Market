/**
 * ColorPatternCustomizer Component - Select color/pattern for product
 */

import { Button } from "@/components/ui/button";
import type { Pattern } from "@/types";

interface ColorPatternCustomizerProps {
  patterns: Pattern[];
  selectedPatternId?: string;
  onSelect: (pattern: Pattern) => void;
}

export default function ColorPatternCustomizer({
  patterns,
  selectedPatternId,
  onSelect,
}: ColorPatternCustomizerProps) {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">Aucun motif disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Sélectionner un motif/couleur <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            onClick={() => onSelect(pattern)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPatternId === pattern.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Color preview */}
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: pattern.primaryColor }}
                  title={pattern.primaryColor}
                />
                {pattern.secondaryColor && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: pattern.secondaryColor }}
                    title={pattern.secondaryColor}
                  />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {pattern.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
