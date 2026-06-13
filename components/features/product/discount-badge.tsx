import { cn } from "@/lib/utils";

type DiscountBadgeProps = {
  discountPct: number;
  className?: string;
};

export const DiscountBadge = ({
  discountPct,
  className,
}: DiscountBadgeProps) => {
  if (discountPct <= 0) return null;

  return (
    <span
      className={cn(
        "rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-md",
        className,
      )}
    >
      -{discountPct}%
    </span>
  );
};
