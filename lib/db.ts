import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

// Instantiates the Prisma Neon adapter using the database connection string to connect Prisma to the Neon serverless database.
const adapter = new PrismaNeon({ connectionString });

// Prisma returns Decimal objects for numeric price fields, which aren't serializable and can't
// be safely passed from server components to client components. This extension intercepts every
// query result for the product and cart models and converts all Decimal fields to strings
// automatically, so no action or component ever needs to call .toString() manually.
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
      oldPrice: {
        compute(product) {
          return product.oldPrice?.toString() || "";
        },
      },
    },
    cart: {
      itemsPrice: {
        compute(cart) {
          return cart.itemsPrice.toString();
        },
      },
      totalPrice: {
        compute(cart) {
          return cart.totalPrice.toString();
        },
      },
      shippingPrice: {
        compute(cart) {
          return cart.shippingPrice.toString();
        },
      },
    },
  },
});