/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";

const ProductCard = ({ product }: { product: any }) => {
  const hasDiscount =
    product.oldPrice && product.price && product.oldPrice > product.price;

  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group relative block overflow-hidden rounded-lg shadow-sm">
      {/* Wishlist Button */}
      <button className="absolute end-4 top-4 z-10 rounded-full bg-white p-1.5 text-gray-900 transition hover:text-gray-900/75">
        <span className="sr-only">Wishlist</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      {/* Discount badge */}
      {hasDiscount && (
        <span className="absolute start-6 top-4 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
          -{discountPct}%
        </span>
      )}

      {/* Product Image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="relative border border-gray-100 bg-white p-6 flex flex-col justify-between">
        {/* Product Name */}
        <div className="min-h-[3.8rem] flex items-start">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-3">
            {product.name}
          </h3>
        </div>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs text-gray-600">
          {product.description}
        </p>

        {/* Price + Buy Button at bottom */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <p className="text-sm font-semibold text-gray-900">
                  ₴{product.price}
                </p>
                <p className="text-xs text-gray-400 line-through">
                  ₴{product.oldPrice}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                ₴{product.price}
              </p>
            )}
          </div>

          <button
            type="button"
            className="rounded-sm bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:scale-105"
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
