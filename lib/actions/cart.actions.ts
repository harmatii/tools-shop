"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/prisma/generated";

// Read the session cart cookie set by middleware on every request.
// If somehow missing, something is badly wrong — bail out early.
async function getSessionCartId(): Promise<string> {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");
  return sessionCartId;
}

// Read the session to get the user ID if logged in.
// If no user, userId stays undefined and we look up the cart by sessionCartId cookie instead.
async function getUserId(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.id ? (session.user.id as string) : undefined;
}

// Calculates all three price fields from the items array.
// Shipping is free over 100, otherwise a flat 10 fee.
// Returns strings (via .toFixed(2)) to match the Zod formattedPrice schema.
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0));
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const totalPrice = round2(itemsPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function getMyCart() {
  const sessionCartId = await getSessionCartId();
  const userId = await getUserId();

  // Logged-in user: look up by userId (survives cookie resets).
  // Guest: look up by sessionCartId cookie (set by middleware).
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
  });
}

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = await getSessionCartId();
    const userId = await getUserId();

    // Fetch the existing cart for this user/session. undefined means first visit — cart is empty.
    const cart = await getMyCart();

    // Validate the item coming from the client via Zod.
    // This checks the shape and types of the data, and also guards against extra fields sneaking in that we don't expect.
    const item = cartItemSchema.parse(data);

    // Fetch the full product row from the DB. Used below to check stock and get the slug for revalidation.
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      // No cart exists yet for this user/session. This is the first item being added.
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      // Adds new row to cart table with userId (if logged in) or sessionCartId (if guest) so we can look it up later.
      await prisma.cart.create({
        data: newCart,
      });

      // Tell Next.js to regenerate the product page so the UI reflects the updated state.
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // Cart already exists with some item/items
      // Check if this product is already in the cart.
      // Two paths: already there → bump qty; not there → add it.
      const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);
      // If the item is already in the cart, we want to increment the qty by 1.
      if (existItem) {
        // Can't add one more if stock is already fully claimed by the current quantity.
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }
        // Find the item in the array and increment its qty directly (mutates in-memory array).
        // The ! asserts find() won't return undefined — we know it exists from the check above.
        (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1;
      } else {
        // Item not yet in cart — check if there's at least 1 in stock before adding.
        if (product.stock < 1) throw new Error("Not enough stock");

        // Item not yet in cart — append it to the in-memory items array.
        cart.items.push(item);
      }

      // Update the existing cart row in the database with the new items array and prices.
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${existItem ? "updated in" : "added to"} cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function removeItemFromCart(productId: string) {
  try {
    await getSessionCartId();

    // Fetch the full product row so we can verify it exists and get the slug for revalidation at the end.
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Fetch the current cart — if it doesn't exist there's nothing to remove from, so we throw.
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Confirm the item is actually in the cart before we try to remove it.
    const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
    if (!exist) throw new Error("Item not found");

    // If qty is 1, removing it means the item should disappear from the cart entirely.
    // If qty is more than 1, we just decrement by 1 and keep the item in the cart.
    if (exist.qty === 1) {
      // Filter creates a new array with every item except the one being removed, then replaces cart.items.
      cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
    } else {
      // Find the item in the array and reduce its qty by 1 directly (mutates in-memory array).
      (cart.items as CartItem[]).find((x) => x.productId === exist.productId)!.qty = exist.qty - 1;
    }

    // Save the updated items array to the DB and recalculate all prices from scratch based on what's left.
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
