import type { Invoice, InvoiceStatus } from "../types/invoice";
import { sampleInvoices } from "../data/invoices";

const statuses: InvoiceStatus[] = [
  "matched",
  "amount_mismatch",
  "gstin_mismatch",
  "missing_in_gstr2b",
];

export const generateInvoices = (count: number): Invoice[] => {
  return Array.from({ length: count }, (_, index) => {
    const baseInvoice = sampleInvoices[index % sampleInvoices.length];

    const invoiceNumber = index + 1;

    const taxableAmount =
      baseInvoice.taxable_amount + (index % 10) * 5000;

    const taxRate =
      baseInvoice.igst > 0 ? 0.18 : 0.09;

    const igst =
      baseInvoice.igst > 0
        ? taxableAmount * 0.18
        : 0;

    const cgst =
      baseInvoice.igst === 0
        ? taxableAmount * taxRate
        : 0;

    const sgst =
      baseInvoice.igst === 0
        ? taxableAmount * taxRate
        : 0;

    const totalAmount =
      taxableAmount + igst + cgst + sgst;

    const status =
      statuses[index % statuses.length];

    let gstr2bAmount: number | null = totalAmount;

    if (status === "amount_mismatch") {
      gstr2bAmount = totalAmount - 5000;
    }

    if (status === "missing_in_gstr2b") {
      gstr2bAmount = null;
    }

    return {
      ...baseInvoice,

      id: `inv-${String(invoiceNumber).padStart(4, "0")}`,

      invoice_number: `${baseInvoice.invoice_number}-${invoiceNumber}`,

      taxable_amount: taxableAmount,

      igst,
      cgst,
      sgst,

      total_amount: totalAmount,

      gstr2b_amount: gstr2bAmount,

      status,
    };
  });
};