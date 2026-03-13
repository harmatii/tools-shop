import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const formattedPrice = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must be a string that represents a valid number.",
  );

//Schema for inserting products into the database
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  category: z.string().min(3, "Category must be at least 3 characters long"),
  images: z.array(z.string()).min(1, "Product must have at least 1 image"),
  brand: z.string().min(3, "Brand must be at least 3 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
  price: formattedPrice,
  oldPrice: z.preprocess(
    (value) => (value === "" ? undefined : value),
    formattedPrice.optional(),
  ),
  isFeatured: z.coerce.boolean().default(false),
  banner: z.string().nullable().optional(),
});
