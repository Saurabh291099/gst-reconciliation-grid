import { useCallback, useState, useMemo } from "react";
import { generateInvoices } from "./utils/generateInvoices";
import type { Invoice, InvoiceStatus } from "./types/invoice";
import { ReconciliationGrid } from "./components/ReconciliationGrid";

function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    generateInvoices(1000),
  );
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all",
  );

  const handleReconcile = useCallback((invoiceIds: string[]) => {
    const selectedIdSet = new Set(invoiceIds);

    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) => {
        if (!selectedIdSet.has(invoice.id)) {
          return invoice;
        }

        return {
          ...invoice,
          status: "matched",
        };
      }),
    );
  }, []);

  const handleEditAmount = useCallback(
    (invoiceId: string, newAmount: number) => {
      setInvoices((currentInvoices) =>
        currentInvoices.map((invoice) => {
          if (invoice.id !== invoiceId) {
            return invoice;
          }

          return {
            ...invoice,
            total_amount: newAmount,
            status: "unreconciled",
          };
        }),
      );
    },
    [],
  );

  const handleStatusFilterChange = useCallback(
    (value: InvoiceStatus | "all") => {
      setStatusFilter(value);
    },
    [],
  );

  const filteredInvoices = useMemo(() => {
  if (statusFilter === "all") {
    return invoices;
  }

  return invoices.filter(
    (invoice) =>
      invoice.status === statusFilter,
  );
}, [invoices, statusFilter]);

  return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mx-auto mb-6 flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              GST Reconciliation
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Compare purchase invoices against GSTR-2B
            </p>
          </div>

          <span
            className="
        shrink-0
        rounded-lg
        border
        border-slate-200
        bg-white
        px-3
        py-2
        text-sm
        font-semibold
        text-slate-600
        shadow-sm
      "
          >
            {statusFilter === "all"
              ? `${invoices.length.toLocaleString("en-IN")} invoices`
              : `${filteredInvoices.length.toLocaleString(
                  "en-IN",
                )} of ${invoices.length.toLocaleString("en-IN")} invoices`}
          </span>
        </header>

        <ReconciliationGrid
          data={filteredInvoices}
          onReconcile={handleReconcile}
          onEditAmount={handleEditAmount}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />
      </main>
  );
}

export default App;
