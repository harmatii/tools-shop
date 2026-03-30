import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import { WishlistButton } from "@/components/shared/product/wishlist-button";
import { DiscountBadge } from "@/components/shared/product/discount-badge";
import { ProductPrice } from "@/components/shared/product/product-price";
import { BuyButton } from "@/components/shared/product/buy-button";
import { getDiscountPercentage } from "@/lib/utils";
import { ProductImages } from "@/components/shared/product/product-images";

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : undefined;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Product Images */}
        <ProductImages images={product.images} />

        {/* Category */}
        <div className="flex flex-col space-y-6 rounded-2xl border border-gray-200 bg-white p-6 lg:p-8">
          <div>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {product.category || "Category"}
            </Badge>
          </div>

          {/* Product Name and Price */}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <ProductPrice price={price} oldPrice={oldPrice} />
          </div>

          {/* Size */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Select Size</p>
            <div className="flex flex-wrap gap-3">
              {["S", "M", "L", "XL", "XXL"].map((size, index) => (
                <Button
                  key={size}
                  variant={index === 0 ? "default" : "outline"}
                  className="h-12 min-w-16 rounded-full"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Buy button and wishlist */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <BuyButton className="w-full" />
            </div>
            <WishlistButton className="h-12 w-12 rounded-full" />
          </div>

          {/* Description and Details */}
          <div className="rounded-2xl border border-gray-200 p-5">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Description & Fit
            </h2>
            <p className="text-sm leading-6 text-gray-600">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
