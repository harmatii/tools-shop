export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "RBH Store";
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A modern ecommerce store built with Next.js";
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 8;
export const signInDefaultValues = {
  email: "",
  password: "",
};
export const signUpDefaultValues = {
  email: "",
  password: "",
  confirmPassword: "",
};
export const contactInfoDefaultValues = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
};
// The `as const` keeps carrier and deliveryType as their literal values instead of
// widening them to plain strings, which is what the zod enum in the schema expects.
export const shippingAddressDefaultValues = {
  carrier: "novaPoshta",
  deliveryType: "branch",
  city: "",
  branch: "",
  streetAddress: "",
  postalCode: "",
  country: "",
} as const;
