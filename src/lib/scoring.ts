import { DIMENSIONS } from "./constants";

/**
 * Score tiers: high (green), mid (amber), low (red).
 * Dimension scores are /20, overall scores are /100.
 */

export function tierClass20(score: number): string {
  if (score >= 15) return "bg-score-high text-white";
  if (score >= 10) return "bg-score-mid text-gray-900";
  return "bg-score-low text-white";
}

export function tierClass100(score: number): string {
  if (score >= 75) return "bg-score-high text-white";
  if (score >= 50) return "bg-score-mid text-gray-900";
  return "bg-score-low text-white";
}

export function tierBarClass(score: number): string {
  if (score >= 15) return "bg-score-high";
  if (score >= 10) return "bg-score-mid";
  return "bg-score-low";
}

export function tierTextClass(score: number): string {
  if (score >= 15) return "text-score-high";
  if (score >= 10) return "text-score-mid";
  return "text-score-low";
}

export function strokeColor(score: number): string {
  if (score >= 75) return "#3F7556";
  if (score >= 50) return "#C8A53D";
  return "#A24E3C";
}

export function changeClass(change: string): string {
  if (change.startsWith("+") && change !== "+0") return "text-score-high";
  if (change.startsWith("-")) return "text-score-low";
  return "text-text-caption";
}

export function topDim(dims: number[]): { name: string; score: number } {
  let i = 0;
  for (let j = 1; j < dims.length; j++) if (dims[j] > dims[i]) i = j;
  return { name: DIMENSIONS[i].name, score: dims[i] };
}

export function bottomDim(dims: number[]): { name: string; score: number } {
  let i = 0;
  for (let j = 1; j < dims.length; j++) if (dims[j] < dims[i]) i = j;
  return { name: DIMENSIONS[i].name, score: dims[i] };
}

/**
 * Calculate a dimension score (/20) from 4 sub-component star ratings (each 1-5).
 * Dimension score = sum of 4 ratings = max 20.
 */
export function dimensionScore(ratings: number[]): number {
  return ratings.reduce((sum, r) => sum + r, 0);
}

/**
 * Calculate overall score (/100) from 5 dimension scores (each /20).
 * Overall = sum of 5 dimension scores = max 100.
 */
export function overallScore(dimScores: number[]): number {
  return dimScores.reduce((sum, d) => sum + d, 0);
}

/**
 * Generate plausible 5-bucket score distribution centered at a brand's score.
 */
export function genDist(score: number, total: number): number[] {
  const mode = Math.min(4, Math.max(0, Math.floor(score / 4)));
  const weights = [0, 1, 2, 3, 4].map(b => Math.exp(-Math.pow(b - mode, 2) / 1.5));
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map(w => Math.round((w / sum) * total));
  const diff = total - counts.reduce((a, b) => a + b, 0);
  counts[mode] += diff;
  return counts;
}

export const tierBg = tierClass20;
export const tierBg100 = tierClass100;
export const tierBar = tierBarClass;
export const tierText = tierTextClass;

export function hasHistoricalData(change: string, spark?: number[]): boolean {
  if (!change || change === "0" || change === "+0" || change === "-0") return false;
  if (spark && spark.every((v) => v === 0)) return false;
  return true;
}

export function validateWorkEmail(email: string, personalDomains: Set<string>): { ok: boolean; reason?: string } {
  const value = (email || "").trim();
  if (!value) return { ok: false, reason: "Please enter your work email." };
  const m = value.match(/^[^\s@]+@([^\s@]+)$/);
  if (!m) return { ok: false, reason: "Please enter a valid email address." };
  const domain = m[1].toLowerCase();
  if (!domain.includes(".")) return { ok: false, reason: "Please enter a valid email address." };
  if (personalDomains.has(domain)) {
    return { ok: false, reason: "Use your work email — personal addresses (Gmail, Yahoo, etc.) aren't accepted." };
  }
  return { ok: true };
}
