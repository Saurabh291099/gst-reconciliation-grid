import { useMemo, useRef } from "react";
import {
  columnSizingFeature,
  createColumnHelper,
  tableFeatures,
  useTable,
  rowSelectionFeature,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Invoice, InvoiceStatus } from "../types/invoice";
import { formatCurrency, formatDate } from "../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { SelectionCheckbox } from "./SelectionCheckbox";
import { EditableCell } from "./EditableCell";

interface ReconciliationGridProps {
  data: Invoice[];
  onReconcile: (invoiceIds: string[]) => void;
  onEditAmount: (invoiceId: string, value: number) => void;

  statusFilter: InvoiceStatus | "all";

  onStatusFilterChange: (value: InvoiceStatus | "all") => void;
}

// TanStack Table v9 feature configuration
const features = tableFeatures({
  columnSizingFeature,
  rowSelectionFeature,
});

// Strongly typed column helper
const columnHelper = createColumnHelper<typeof features, Invoice>();

export function ReconciliationGrid({
  data,
  onReconcile,
  onEditAmount,
  statusFilter,
  onStatusFilterChange,
}: ReconciliationGridProps) {
  // Column definitions
  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Selection column
        columnHelper.display({
          id: "select",

          header: ({ table }) => {
            const allSelected = table.getIsAllRowsSelected();

            const someSelected = table.getIsSomeRowsSelected();

            return (
              <SelectionCheckbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={table.getToggleAllRowsSelectedHandler()}
                aria-label="Select all invoices"
              />
            );
          },

          cell: ({ row }) => {
            return (
              <SelectionCheckbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                aria-label={`Select invoice ${row.id}`}
              />
            );
          },

          size: 52,
        }),

        columnHelper.accessor("vendor_name", {
          header: "Vendor Name",
        }),

        columnHelper.accessor("vendor_gstin", {
          header: "GSTIN",
        }),

        columnHelper.accessor("invoice_number", {
          header: "Invoice Number",
        }),

        columnHelper.accessor("invoice_date", {
          header: "Invoice Date",

          cell: (info) => {
            return formatDate(info.getValue());
          },
        }),

        columnHelper.accessor("taxable_amount", {
          header: "Taxable Amount",

          cell: (info) => {
            return formatCurrency(info.getValue());
          },
        }),

        columnHelper.accessor("total_amount", {
          header: "Total Amount",

          cell: (info) => {
            const invoice = info.row.original;
            return (
              <EditableCell
                value={info.getValue()}
                onSave={(newValue) => {
                  onEditAmount(invoice.id, newValue);
                }}
              />
            );
          },
        }),

        columnHelper.accessor("gstr2b_amount", {
          header: "GSTR-2B Amount",

          cell: (info) => {
            return formatCurrency(info.getValue());
          },
        }),

        columnHelper.accessor("status", {
          header: "Status",

          cell: (info) => {
            return <StatusBadge status={info.getValue()} />;
          },
        }),
      ]),
    [onEditAmount],
  );

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const table = useTable({
    features,
    columns,
    data,

    getRowId: (row) => row.id,
  });

  const rows = table.getRowModel().rows;
  const selectedRowCount = table.getSelectedRowModel().rows.length;
  const selectedInvoiceIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div
        className="
    flex
    min-h-14
    items-center
    justify-between
    gap-4
    rounded-t-xl
    border
    border-b-0
    border-slate-200
    bg-white
    px-4
  "
      >
        <div className="toolbar-left">
          <span className="selection-count">
            {selectedRowCount === 0
              ? "No invoices selected"
              : `${selectedRowCount} ${
                  selectedRowCount === 1 ? "invoice" : "invoices"
                } selected`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-slate-500"
          >
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => {
              table.resetRowSelection();

              onStatusFilterChange(event.target.value as InvoiceStatus | "all");
            }}
            className="
      min-w-44
      cursor-pointer
      rounded-lg
      border
      border-slate-300
      bg-white
      px-3
      py-2
      text-sm
      text-slate-700
      outline-none
      focus:border-blue-600
      focus:ring-2
      focus:ring-blue-600/10
    "
          >
            <option value="all">All Invoices</option>

            <option value="matched">Matched</option>

            <option value="amount_mismatch">Amount Mismatch</option>

            <option value="gstin_mismatch">GSTIN Mismatch</option>

            <option value="missing_in_gstr2b">Missing in GSTR-2B</option>

            <option value="unreconciled">Unreconciled</option>
          </select>

          <button
            type="button"
            className="
    rounded-lg
    bg-blue-600
    px-3.5
    py-2
    text-sm
    font-semibold
    text-white
    transition
    hover:bg-blue-700
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
            disabled={selectedRowCount === 0}
            onClick={() => {
              onReconcile(selectedInvoiceIds);
              table.resetRowSelection();
            }}
          >
            Mark as Reconciled
          </button>
        </div>
      </div>

      <div
        ref={tableContainerRef}
        className="
    relative
   h-162.5
    w-full
    overflow-auto
    rounded-b-xl
    border
    border-slate-200
    bg-white
  "
      >
        <table
          className="
    grid
    min-w-325
    w-max
  "
        >
          <thead
            className="
    sticky
    top-0
    z-10
    grid
    bg-slate-50
  "
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                    }}
                    className="
    flex
    h-12
    shrink-0
    items-center
    px-4
    text-left
    text-xs
    font-bold
    uppercase
    tracking-wide
    text-slate-600
  "
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            style={{
              height:
                rows.length === 0
                  ? "100%"
                  : `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rows.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <strong>No invoices found</strong>

                    <span>
                      There are no invoices matching the selected status.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];

                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    className={[
                      `invoice-row invoice-row-${row.original.status}`,
                      row.getIsSelected() ? "row-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getAllCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          width: `${cell.column.getSize()}px`,
                        }}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
