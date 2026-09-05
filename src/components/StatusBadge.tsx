import type { InvoiceStatus } from "../types/invoice";

interface StatusBadgeProps {
  status: InvoiceStatus;
}

const statusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    className: string;
  }
> = {
  matched: {
    label: "Matched",
    className: "bg-emerald-50 text-emerald-700",
  },

  amount_mismatch: {
    label: "Amount Mismatch",
    className: "bg-amber-50 text-amber-700",
  },

  gstin_mismatch: {
    label: "GSTIN Mismatch",
    className: "bg-amber-50 text-amber-700",
  },

  missing_in_gstr2b: {
    label: "Missing in GSTR-2B",
    className: "bg-red-50 text-red-700",
  },

  unreconciled: {
    label: "Unreconciled",
    className: "bg-indigo-50 text-indigo-700",
  },
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={[
        "inline-flex",
        "items-center",
        "gap-1.5",
        "whitespace-nowrap",
        "rounded-full",
        "px-2.5",
        "py-1",
        "text-xs",
        "font-semibold",
        config.className,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          bg-current
        "
      />

      {config.label}
    </span>
  );
}