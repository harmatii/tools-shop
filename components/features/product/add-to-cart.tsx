"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { Cart, CartItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

export const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  // useTransition gives us isPending to track when a server action is in flight, so we can show a loading spinner on the buttons instead of leaving them unresponsive.
  const [isPending, startTransition] = useTransition();

  // Call the add server action inside a transition so the UI can show a loading state while it runs.
  // On failure we show a destructive toast; on success a confirmation toast with a "Go To Cart" link.
  const handleAddToCart = async () => {
    startTransition(async () => {
      const response = await addItemToCart(item);
      if (!response.success) {
        toast({
          variant: "destructive",
          description: response.message || "Failed to add item to cart.",
        });
        return;
      }
      toast({
        description: response.message || "Item added to cart.",
        action: (
          <ToastAction className="bg-primary text-white hover:bg-gray-800" altText="Go To Cart" onClick={() => router.push("/cart")}>
            <Plus /> Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  // Call the remove server action and show a toast with the result — variant switches to destructive if it fails.
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const response = await removeItemFromCart(item.productId);

      toast({
        variant: response.success ? "default" : "destructive",
        description: response.message,
      });
      return;
    });
  };

  // cart can be undefined on first visit, so we check it exists before searching items.
  // If found, existItem holds the matched CartItem so we can read its current qty.
  const existItem = cart && cart.items.find((x) => x.productId === item.productId);

  // If the item is already in the cart, show quantity controls (− qty +) so the user can adjust the amount.
  // While a server action is in flight, replace the whole control group with a single centered spinner.
  // If not in cart, show the standard full-width "Add To Cart" button.
  return existItem ? (
    <div>
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin mx-auto" />
      ) : (
        <>
          <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
            <Minus className="w-4 h-4" />
          </Button>
          <span className="px-2">{existItem.qty}</span>
          <Button type="button" variant="outline" onClick={handleAddToCart}>
            <Plus className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  ) : (
    <Button type="button" onClick={handleAddToCart}>
      {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      Add To Cart
    </Button>
  );
};
