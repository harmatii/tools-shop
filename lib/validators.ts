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
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for signing up a user
export const signUpFormSchema = z
  .object({
    email: z.email("Invalid email address"),
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
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

// Schema for the user contact information form
export const contactInfoSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),
  phoneNumber: z.string().min(3, "Phone number must be at least 3 characters"),
  email: z.email("Invalid email address"),
});

// Schema for the checkout delivery method section. The user first picks a carrier
// and a delivery type; which of the remaining fields are actually required depends
// on that choice, so we keep them all as plain strings here and enforce the
// conditional rules in superRefine below. We deliberately avoid a discriminated
// union because react-hook-form works much more smoothly with a single flat object type.
export const shippingAddressSchema = z
  .object({
    carrier: z.enum(["novaPoshta", "ukrPoshta"]),
    deliveryType: z.enum(["branch", "address"]),
    city: z.string().min(3, "City must be at least 3 characters"),
    branch: z.string(),
    // Nova Poshta internal ids of the chosen city and branch. The user never
    // types these — the comboboxes fill them in when an option is picked, and
    // we keep them so we can create a waybill through the API later.
    cityRef: z.string(),
    branchRef: z.string(),
    streetAddress: z.string(),
    postalCode: z.string(),
    country: z.string(),
  })
  .superRefine((data, ctx) => {
    // When delivering to a branch (відділення) the user only needs to tell us which one.
    if (data.deliveryType === "branch" && data.branch.trim().length < 1) {
      ctx.addIssue({ code: "custom", path: ["branch"], message: "Branch is required" });
    }

    // When delivering to the door (адресна доставка) we need the full address instead.
    if (data.deliveryType === "address") {
      if (data.streetAddress.trim().length < 3) {
        ctx.addIssue({ code: "custom", path: ["streetAddress"], message: "Address must be at least 3 characters" });
      }
      if (data.postalCode.trim().length < 3) {
        ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Postal code must be at least 3 characters" });
      }
      if (data.country.trim().length < 3) {
        ctx.addIssue({ code: "custom", path: ["country"], message: "Country must be at least 3 characters" });
      }
    }
  });
