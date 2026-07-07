// Utility: Combines multiple class names into a single optimized string.
// - `clsx` handles conditional classes (e.g., clsx("a", false && "b") → "a").
// - `tailwind-merge` resolves Tailwind class conflicts
//    (e.g., "p-2 p-4" → "p-4", "text-left text-center" → "text-center").
// The `cn()` function is used across the app to safely merge Tailwind classes
// without duplicates or conflicting styles.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CartItem, Product } from "@/types";

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

// Calculate discount percentage based on current price and old price
export function getDiscountPercentage(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Only allow callback URLs that are same-site paths.
// Blocks: full URLs, protocol-relative URLs, javascript: URIs, etc.
export function safeCallbackUrl(url: string | null | undefined): string {
  if (typeof url !== "string") return "/";
  if (!url.startsWith("/")) return "/";
  if (url.startsWith("//")) return "/";
  return url;
}

// Build a CartItem snapshot from a product.
// Used by every "add to cart" call site so the product → cart-item mapping
// lives in one place instead of being duplicated inline.
export function productToCartItem(product: Product): CartItem {
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    qty: 1,
    image: product.images[0],
  };
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if (error.name === "ZodError") {
    // Handle Zod error
    const fieldErrors = error.issues.map((issue: { message: string }) => issue.message);

    return fieldErrors.join(". ");
  } else if (error.name === "PrismaClientKnownRequestError" && error.code === "P2002") {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === "string" ? error.message : JSON.stringify(error.message);
  }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is not a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("uk-UA", {
  currency: "UAH",
  style: "currency",
  minimumFractionDigits: 2,
});

// Format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}
