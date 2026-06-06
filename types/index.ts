import { z } from "zod";
import { insertProductSchema, cartItemSchema, insertCartSchema } from "../lib/validators";

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