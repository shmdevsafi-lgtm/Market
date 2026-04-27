/**
 * usePasswordStrength Hook
 * Calculates password strength in real-time and returns score, label, and color
 */

import { useMemo } from "react";

export interface PasswordStrength {
  score: number; // 0-100
  label: string; // Très faible, Faible, Moyen, Fort, Très fort
  color: string; // Tailwind color class (red, orange, yellow, lime, green)
  isStrong: boolean; // true if score >= 70
}

/**
 * Calculate password strength
 *
 * Criteria:
 * - Length (0-30 points)
 *   - >= 8 chars: +10
 *   - >= 12 chars: +10
 *   - >= 16 chars: +10
 * - Complexity (0-70 points)
 *   - lowercase letters: +15
 *   - uppercase letters: +15
 *   - numbers: +15
 *   - special chars: +25
 *
 * Total: 100 points possible
 *
 * Score ranges:
 * - 0-30: Very weak (red)
 * - 30-50: Weak (orange)
 * - 50-70: Medium (yellow)
 * - 70-85: Strong (lime)
 * - 85-100: Very strong (green)
 */
function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  // Length scoring (0-30 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Lowercase letters (0-15 points)
  if (/[a-z]/.test(password)) score += 15;

  // Uppercase letters (0-15 points)
  if (/[A-Z]/.test(password)) score += 15;

  // Numbers (0-15 points)
  if (/[0-9]/.test(password)) score += 15;

  // Special characters (0-25 points)
  if (/[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>\/?]/.test(password)) score += 25;

  // Clamp score to 100
  score = Math.min(score, 100);

  // Determine label and color based on score
  let label: string;
  let color: string;
  let isStrong: boolean;

  if (score < 30) {
    label = "Très faible";
    color = "red";
    isStrong = false;
  } else if (score < 50) {
    label = "Faible";
    color = "orange";
    isStrong = false;
  } else if (score < 70) {
    label = "Moyen";
    color = "yellow";
    isStrong = false;
  } else if (score < 85) {
    label = "Fort";
    color = "lime";
    isStrong = true;
  } else {
    label = "Très fort";
    color = "green";
    isStrong = true;
  }

  return { score, label, color, isStrong };
}

/**
 * Hook for password strength calculation
 */
export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "Entrez un mot de passe",
        color: "gray",
        isStrong: false,
      };
    }
    return calculatePasswordStrength(password);
  }, [password]);
}

/**
 * Get Tailwind color class for the score
 */
export function getPasswordStrengthColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: "text-red-500 bg-red-50 border-red-200",
    orange: "text-orange-500 bg-orange-50 border-orange-200",
    yellow: "text-yellow-500 bg-yellow-50 border-yellow-200",
    lime: "text-lime-500 bg-lime-50 border-lime-200",
    green: "text-green-500 bg-green-50 border-green-200",
    gray: "text-gray-400 bg-gray-50 border-gray-200",
  };
  return colorMap[color] || colorMap.gray;
}

/**
 * Get progress bar color class
 */
export function getProgressBarColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    lime: "bg-lime-500",
    green: "bg-green-500",
    gray: "bg-gray-300",
  };
  return colorMap[color] || colorMap.gray;
}
