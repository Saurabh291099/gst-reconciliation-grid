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
    className: "status-badge status-matched",
  },

  amount_mismatch: {
    label: "Amount Mismatch",
    className: "status-badge status-warning",
  },

  gstin_mismatch: {
    label: "GSTIN Mismatch",
    className: "status-badge status-warning",
  },

  missing_in_gstr2b: {
    label: "Missing in GSTR-2B",
    className: "status-badge status-missing",
  },

  unreconciled: {
    label: "Unreconciled",
    className: "status-badge status-unreconciled",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={config.className}>
      <span className="status-dot" />
      {config.label}
    </span>
  );
}