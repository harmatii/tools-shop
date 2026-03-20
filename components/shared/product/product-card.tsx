/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { WishlistButton } from "./wishlist-button";
import { DiscountBadge } from "./discount-badge";
import { getDiscountPercentage } from "@/lib/utils";
import { BuyButton } from "./buy-button";
import { ProductPrice } from "./product-price";

const ProductCard = ({ product }: { product: Product }) => {
  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : undefined;

  return (
    <div className="group relative block overflow-hidden rounded-lg shadow-sm">
      <WishlistButton className="absolute end-4 top-4 z-10" />
      <DiscountBadge
        discountPct={getDiscountPercentage(price, oldPrice)}
        className="absolute start-6 top-4 z-10"
      />

      {/* Product Image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="relative border border-gray-100 bg-white p-6 flex flex-col justify-between">
        {/* Product Name */}
        <div className="min-h-[2.5rem] flex items-start">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <ProductPrice price={price} oldPrice={oldPrice} />
          <BuyButton />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
