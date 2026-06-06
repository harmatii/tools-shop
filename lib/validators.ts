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
  description: z.string().min(3, "Description must be at least 3 characters long"),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
  price: formattedPrice,
  oldPrice: z.preprocess((value) => (value === "" ? undefined : value), formattedPrice.optional()),
  isFeatured: z.coerce.boolean().default(false),
  banner: z.string().nullable().optional(),
});

// Schema for signing users in
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for signing up a user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  image: z.string().min(1, "Image is required"),
  price: formattedPrice,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: formattedPrice,
  totalPrice: formattedPrice,
  shippingPrice: formattedPrice,
  taxPrice: formattedPrice,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});
