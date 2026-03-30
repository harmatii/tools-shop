"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  const currentImage = images[current] ?? images[0];

  if (!images.length) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-500">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={currentImage}
          alt="Product image"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setCurrent(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-xl border bg-gray-100 transition hover:opacity-80",
              current === index
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200",
            )}
          >
            <Image
              src={image}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="25vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
