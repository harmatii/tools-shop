import { z } from "zod";
import {
  insertProductSchema,
  cartItemSchema,
  insertCartSchema,
  contactInfoSchema,
  shippingAddressSchema,
} from "../lib/validators";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  createdAt: Date;
};

export type Cart = z.infer<typeof insertCartSchema>;

export type CartRow = Cart & {
  id: string;
  createdAt: Date;
};

export type CartItem = z.infer<typeof cartItemSchema>;

export type ContactInfo = z.infer<typeof contactInfoSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
