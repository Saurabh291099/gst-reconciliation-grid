import { useRef } from "react";
import {
  columnSizingFeature,
  createColumnHelper,
  tableFeatures,
  useTable,
  rowSelectionFeature,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Invoice } from "../types/invoice";
import { formatCurrency, formatDate } from "../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { SelectionCheckbox } from "./SelectionCheckbox";


interface ReconciliationGridProps {
  data: Invoice[];
  onReconcile: (invoiceIds: string[]) => void;
}

// TanStack Table v9 feature configuration
const features = tableFeatures({
  columnSizingFeature,
  rowSelectionFeature,
});

// Strongly typed column helper
const columnHelper = createColumnHelper<typeof features, Invoice>();

// Column definitions
const columns = columnHelper.columns([

    // Selection column
  columnHelper.display({
    id: "select",

    header: ({ table }) => {
      const allSelected =
        table.getIsAllRowsSelected();

      const someSelected =
        table.getIsSomeRowsSelected();

      return (
        <SelectionCheckbox
          checked={allSelected}
          indeterminate={
            someSelected && !allSelected
          }
          onChange={
            table.getToggleAllRowsSelectedHandler()
          }
          aria-label="Select all invoices"
        />
      );
    },

    cell: ({ row }) => {
      return (
        <SelectionCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={
            row.getToggleSelectedHandler()
          }
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
      return formatCurrency(info.getValue());
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
]);

export function ReconciliationGrid({ data, onReconcile }: ReconciliationGridProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const table = useTable({
    features,
    columns,
    data,
  });

  const rows = table.getRowModel().rows;
  const selectedRowCount =
  table.getSelectedRowModel().rows.length;
const selectedInvoiceIds =
  table
    .getSelectedRowModel()
    .rows
    .map((row) => row.original.id);


  const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 48,
  overscan: 8,
});

  return (

    <>
    <div className="grid-toolbar">
  <span className="selection-count">
    {selectedRowCount === 0
      ? "No invoices selected"
      : `${selectedRowCount} ${
          selectedRowCount === 1
            ? "invoice"
            : "invoices"
        } selected`}
  </span>

  <button
    type="button"
    className="reconcile-button"
    disabled={selectedRowCount === 0}
    onClick={() => {
      onReconcile(selectedInvoiceIds);
      table.resetRowSelection();
    }}
  >
    Mark as Reconciled
  </button>
</div>
    
    
    <div ref={tableContainerRef} className="grid-wrapper">
      <table className="reconciliation-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
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
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
