export type InvoiceStatus =
  | "matched"
  | "amount_mismatch"
  | "gstin_mismatch"
  | "missing_in_gstr2b"
  | "unreconciled";

export interface Invoice {
  id: string;
  vendor_name: string;
  vendor_gstin: string;
  invoice_number: string;
  invoice_date: string;

  taxable_amount: number;
  igst: number;
  cgst: number;
  sgst: number;

  total_amount: number;
  gstr2b_amount: number | null;

  status: InvoiceStatus;
}