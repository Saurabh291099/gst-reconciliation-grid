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

const features = tableFeatures({
  columnSizingFeature,
  rowSelectionFeature,
});

const columnHelper = createColumnHelper<typeof features, Invoice>();

 const rowStatusClasses: Record<InvoiceStatus, string> = {
    matched: "border-l-2 border-l-emerald-500",
    amount_mismatch: "border-l-2 border-l-amber-500",
    gstin_mismatch: "border-l-2 border-l-amber-500",
    missing_in_gstr2b: "border-l-2 border-l-red-500",
    unreconciled: "border-l-2 border-l-indigo-500",
  };
export function ReconciliationGrid({
  data,
  onReconcile,
  onEditAmount,
  statusFilter,
  onStatusFilterChange,
}: ReconciliationGridProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
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
                aria-label={`Select invoice ${row.original.invoice_number}`}
              />
            );
          },

          size: 44,
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
          size: 220,
          cell: (info) => {
            return <StatusBadge status={info.getValue()} />;
          },
        }),
      ]),
    [onEditAmount],
  );

  const columnTemplate = columns
    .map((column, index) => {
      if (index === 0) {
        return "44px";
      }

      return `minmax(${column.size ?? 150}px, 1fr)`;
    })
    .join(" ");

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

  const statusOptions: Array<{
  value: InvoiceStatus | "all";
  label: string;
}> = [
  {
    value: "all",
    label: "All Invoices",
  },
  {
    value: "matched",
    label: "Matched",
  },
  {
    value: "amount_mismatch",
    label: "Amount Mismatch",
  },
  {
    value: "gstin_mismatch",
    label: "GSTIN Mismatch",
  },
  {
    value: "missing_in_gstr2b",
    label: "Missing in GSTR-2B",
  },
  {
    value: "unreconciled",
    label: "Unreconciled",
  },
];
 

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Toolbar */}
      <div
        className="
        flex
        min-h-14
        flex-wrap
        items-center
        justify-between
        gap-4
        rounded-t-xl
        border
        border-b-0
        border-slate-200
        bg-white
        px-4
        py-2
      "
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-slate-600">
            {selectedRowCount === 0
              ? "No invoices selected"
              : `${selectedRowCount} ${
                  selectedRowCount === 1 ? "invoice" : "invoices"
                } selected`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            transition
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-600/10
          "
          >
            {/* <option value="all">All Invoices</option>

            <option value="matched">Matched</option>

            <option value="amount_mismatch">Amount Mismatch</option>

            <option value="gstin_mismatch">GSTIN Mismatch</option>

            <option value="missing_in_gstr2b">Missing in GSTR-2B</option>

            <option value="unreconciled">Unreconciled</option> */}

            {statusOptions.map((option) => (
  <option
    key={option.value}
    value={option.value}
  >
    {option.label}
  </option>
))}
          </select>

          <button
            type="button"
            disabled={selectedRowCount === 0}
            onClick={() => {
              onReconcile(selectedInvoiceIds);
              table.resetRowSelection();
            }}
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
            focus:outline-none
            focus:ring-2
            focus:ring-blue-600/20
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          >
            Mark as Reconciled
          </button>
        </div>
      </div>

      {/* Scroll Container */}
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
          className="grid w-full"
          style={{
            minWidth: `${columns.reduce(
              (total, column) => total + (column.size ?? 150),
              0,
            )}px`,
          }}
        >
          {/* Header */}
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
              <tr
                key={headerGroup.id}
                className="grid w-full"
                style={{
                  gridTemplateColumns: columnTemplate,
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={[
                      "flex",
                      "h-12",
                      "min-w-0",
                      "items-center",
                      "overflow-hidden",
                      "border-b",
                      "border-slate-200",
                      header.id === "select" ? "justify-center px-2" : "px-4",
                      "text-left",
                      "text-xs",
                      "font-bold",
                      "uppercase",
                      "tracking-wide",
                      "text-slate-600",
                      "whitespace-nowrap",
                    ].join(" ")}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody
            className="relative grid w-full"
            style={{
              height:
                rows.length === 0
                  ? "100%"
                  : `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rows.length === 0 ? (
              <tr className="flex min-h-75 w-full">
                <td
                  colSpan={columns.length}
                  className="
                  flex
                  w-full
                  items-center
                  justify-center
                "
                >
                  <div
                    className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1.5
                    text-center
                  "
                  >
                    <strong className="text-sm font-semibold text-slate-700">
                      No invoices found
                    </strong>

                    <span className="text-sm text-slate-500">
                      There are no invoices matching the selected status.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];

                const statusClass = rowStatusClasses[row.original.status];

                const selectionClass = row.getIsSelected()
                  ? "bg-blue-50"
                  : "bg-white";

                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    className={[
                      "absolute",
                      "left-0",
                      "top-0",
                      "grid",
                      "min-h-12",
                      "w-full",
                      "border-b",
                      "border-slate-100",
                      "transition-colors",
                      "hover:bg-slate-50",
                      "will-change-transform",
                      statusClass,
                      selectionClass,
                    ].join(" ")}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      gridTemplateColumns: columnTemplate,
                    }}
                  >
                    {row.getAllCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={[
                          "flex",
                          "h-12",
                          "min-w-0",
                          "items-center",
                          "overflow-hidden",
                          "text-sm",
                          "text-slate-700",
                          "whitespace-nowrap",
                          cell.column.id === "select"
                            ? "justify-center px-2"
                            : "px-4",
                        ].join(" ")}
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
