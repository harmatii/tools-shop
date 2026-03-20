type ProductPriceProps = {
  price: number;
  oldPrice?: number;
};

export const ProductPrice = ({ price, oldPrice }: ProductPriceProps) => {
  const hasDiscount = oldPrice !== undefined && oldPrice > price;

  return (
    <div className="flex flex-col">
      {hasDiscount ? (
        <>
          <p className="text-sm font-semibold text-gray-900">₴{price}</p>
          <p className="text-xs text-gray-400 line-through">₴{oldPrice}</p>
        </>
      ) : (
        <p className="text-sm font-semibold text-gray-900">₴{price}</p>
      )}
    </div>
  );
};
