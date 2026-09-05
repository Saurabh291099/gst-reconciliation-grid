// import "./App.css";
import {
  useCallback,
  useState,
} from "react";
import { generateInvoices } from "./utils/generateInvoices";
import type { Invoice, InvoiceStatus } from "./types/invoice";
import { ReconciliationGrid } from "./components/ReconciliationGrid";

function App() {
  // const [invoices] = useState<Invoice[]>(() => generateInvoices(1000));
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    generateInvoices(1000),
  );
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all",
  );

  // console.log("Generated invoices:", invoices);

  const handleReconcile = useCallback( (invoiceIds: string[]) => {
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

  const handleEditAmount = useCallback((invoiceId: string, newAmount: number) => {
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
  }, []);

  const handleStatusFilterChange = useCallback( (value: InvoiceStatus | "all") => {
    setStatusFilter(value);
  }, []);

  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === statusFilter);

  
  return (
    <>
      <main className="app">
        <header className="app-header">
          <div>
            <h1>GST Reconciliation</h1>

            <p>Compare purchase invoices against GSTR-2B</p>
          </div>

         <span className="invoice-count">
  {statusFilter === "all"
    ? `${invoices.length.toLocaleString(
        "en-IN"
      )} invoices`
    : `${filteredInvoices.length.toLocaleString(
        "en-IN"
      )} of ${invoices.length.toLocaleString(
        "en-IN"
      )} invoices`}
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
    </>
  );
}

export default App;
