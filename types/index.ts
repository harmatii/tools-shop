import { z } from "zod";
import { insertProductSchema, cartItemSchema, insertCartSchema, contactInfoSchema, shippingAddressSchema } from "../lib/validators";

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

// The shape our async comboboxes work with: `label` is the text the user sees
// in the dropdown and `value` is the carrier's id for it (a Nova Poshta ref or
// an Ukrposhta city id / postcode) that we store alongside the text so we can
// create a waybill through the carrier's API later.
export type ComboboxOption = {
  label: string;
  value: string;
};
