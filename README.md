# GST Reconciliation Grid

A React + TypeScript prototype for reconciling purchase invoices against GSTR-2B records.

The grid is designed to provide a spreadsheet-like workflow for accountants and finance teams, including inline editing, row selection, bulk reconciliation, status filtering, and performant scrolling.

## Features

- 1,000 programmatically generated invoice records
- Virtualized row rendering for smooth scrolling
- Inline editing of total amount
- Keyboard interactions for editing:
  - Enter → save
  - Escape → cancel
- Edited invoices automatically become `unreconciled`
- Visual distinction between reconciliation statuses
- Single and multi-row selection
- Select-all and indeterminate selection state
- Bulk "Mark as Reconciled" action
- Status-based filtering
- Responsive layout
- Tailwind CSS styling

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Table
- TanStack Virtual
- Tailwind CSS

## Architecture

The application keeps invoice data and business operations in `App.tsx`, while `ReconciliationGrid` is responsible for presenting and interacting with the data.

The main data flow is:

App state
→ filtering
→ ReconciliationGrid
→ TanStack Table
→ TanStack Virtual
→ rendered rows

Invoice updates are handled by callbacks from the grid:

- `onEditAmount`
- `onReconcile`

This keeps data ownership in the parent component and makes the grid reusable.

## Why TanStack Table?

I chose TanStack Table because it provides a headless table model while allowing full control over the UI. This was useful for building a spreadsheet-like interface rather than relying on a pre-styled data-grid component.

## Performance

The grid uses TanStack Virtual for row virtualization.

The full invoice dataset remains available to the application, but only the rows currently visible in the viewport, plus a small overscan buffer, are rendered into the DOM.

This prevents the browser from maintaining hundreds or thousands of rendered row elements unnecessarily and keeps scrolling responsive.

Rows also use stable invoice IDs through `getRowId`, so selection and row identity remain consistent when the displayed dataset changes.

## Handling 50,000 Rows

For 50,000 rows, I would keep virtualization for the rendering layer, but I would avoid loading and processing the entire dataset on the client whenever possible.

The main changes would be:

1. Server-side pagination or infinite loading to reduce the amount of data held in the browser.
2. Server-side filtering and sorting for expensive operations over the full dataset.
3. Debounced search/filter inputs to avoid repeated requests.
4. Incremental data fetching as the user scrolls.
5. Avoid unnecessary copying and transformation of large datasets in React state.
6. Use a Web Worker only for genuinely expensive client-side computations that still need to happen in the browser.

The main bottlenecks at this scale would likely shift from DOM rendering to data transfer, client-side filtering/sorting, memory usage, and state updates.

## Trade-offs

For this prototype, I chose local React state instead of Redux or another global state library because the application has a small and well-defined state boundary. Adding a global state solution would increase complexity without providing much value for this scope.

I also used fixed row heights for virtualization. This keeps row measurements predictable and avoids unnecessary runtime measurement work.

## Improvements With More Time

- Add an undo action or confirmation flow for bulk reconciliation.
- Add richer inline validation, especially for GSTIN values.
- Add keyboard navigation between cells to provide a more complete spreadsheet experience.
- Connect the grid to a real backend API with server-side filtering and pagination.

## AI Tooling

I used ChatGPT as a development assistant during implementation. It was used for discussing the component architecture, reviewing implementation decisions, debugging TanStack Table API issues, and improving UX/performance details.

All generated suggestions were reviewed and adapted manually while building and testing the application.

## Running Locally

Install dependencies:

```bash
npm install