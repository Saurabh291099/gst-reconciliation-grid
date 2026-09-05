import type {
  Invoice,
  InvoiceStatus,
} from "../types/invoice";

import { sampleInvoices } from "../data/invoices";

const GENERATED_STATUSES: InvoiceStatus[] = [
  "matched",
  "amount_mismatch",
  "gstin_mismatch",
  "missing_in_gstr2b",
];

const roundCurrency = (value: number): number => {
  return Math.round(value);
};

export const generateInvoices = (
  count: number,
): Invoice[] => {
  return Array.from(
    { length: count },
    (_, index) => {
      const baseInvoice =
        sampleInvoices[
          index % sampleInvoices.length
        ];

      const sequence = index + 1;

      const taxableAmount =
        baseInvoice.taxable_amount +
        (index % 10) * 5000;

      const isIgstInvoice =
        baseInvoice.igst > 0;

      const igst = isIgstInvoice
        ? roundCurrency(
            taxableAmount * 0.18,
          )
        : 0;

      const cgst = isIgstInvoice
        ? 0
        : roundCurrency(
            taxableAmount * 0.09,
          );

      const sgst = isIgstInvoice
        ? 0
        : roundCurrency(
            taxableAmount * 0.09,
          );

      const totalAmount =
        taxableAmount +
        igst +
        cgst +
        sgst;

      const status =
        GENERATED_STATUSES[
          index %
            GENERATED_STATUSES.length
        ];

      let gstr2bAmount:
        | number
        | null = totalAmount;

      if (status === "amount_mismatch") {
        gstr2bAmount =
          totalAmount - 5000;
      }

      if (
        status ===
        "missing_in_gstr2b"
      ) {
        gstr2bAmount = null;
      }

      return {
        ...baseInvoice,

        id: `inv-${String(sequence).padStart(
          4,
          "0",
        )}`,

        invoice_number:
          `${baseInvoice.invoice_number}-${String(
            sequence,
          ).padStart(4, "0")}`,

        taxable_amount:
          taxableAmount,

        igst,

        cgst,

        sgst,

        total_amount:
          totalAmount,

        gstr2b_amount:
          gstr2bAmount,

        status,
      };
    },
  );
};