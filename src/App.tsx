import "./App.css";
import { useState } from "react";
import { generateInvoices } from "./utils/generateInvoices";
import type { Invoice } from "./types/invoice";

import { ReconciliationGrid } from "./components/ReconciliationGrid";

function App() {
  // const [invoices] = useState<Invoice[]>(() => generateInvoices(1000));
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
  generateInvoices(1000)
);

  // console.log("Generated invoices:", invoices);

const handleReconcile = (
  invoiceIds: string[]
) => {
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
    })
  );
};

  return (
    <>
      <main className="app">
      <header className="app-header">
        <div>
          <h1>GST Reconciliation</h1>

          <p>
            Compare purchase invoices against GSTR-2B
          </p>
        </div>

        <span className="invoice-count">
          {invoices.length.toLocaleString("en-IN")} invoices
        </span>
      </header>

      <ReconciliationGrid data={invoices} onReconcile={handleReconcile} />
    </main>
    </>
  );
}

export default App;
