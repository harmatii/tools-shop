type BuyButtonProps = {
  className?: string;
};

export const BuyButton = ({ className }: BuyButtonProps) => {
  return (
    <button
      type="button"
      className={`rounded-sm bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:scale-105 ${className || ""}`}
    >
      Купити
    </button>
  );
};
