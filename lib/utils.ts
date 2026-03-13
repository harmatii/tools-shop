// Utility: Combines multiple class names into a single optimized string.
// - `clsx` handles conditional classes (e.g., clsx("a", false && "b") → "a").
// - `tailwind-merge` resolves Tailwind class conflicts
//    (e.g., "p-2 p-4" → "p-4", "text-left text-center" → "text-center").
// The `cn()` function is used across the app to safely merge Tailwind classes
// without duplicates or conflicting styles.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { number } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Convert prisma object into a regular JS object

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

//Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}
