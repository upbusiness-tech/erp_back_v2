## Why

The product statistics screen needs to present summary cards and rankings without loading sales, sale items, and product relationships into the frontend. The current data access patterns can recalculate the full sales history and return unnecessarily large payloads, increasing database and server load as company data grows.

This change introduces a period-aware, company-scoped dashboard contract so the frontend can load the complete statistics view with one compact request and predictable resource usage.

## What Changes

- Add a product analytics dashboard endpoint that accepts an inclusive date range.
- Return summary metrics and bounded product rankings in a dashboard-specific response.
- Aggregate quantities, revenue, turnover, and stock alerts in the backend instead of the frontend.
- Enforce company isolation, completed-sale filtering, soft-delete filtering, and date-range validation.
- Support frontend presets and custom date ranges through the same API contract.
- Add query and response tests for empty periods, limits, invalid ranges, and company isolation.
- Add a short-lived cache strategy keyed by company and normalized date range when appropriate for the deployment.

## Capabilities

### New Capabilities

- `product-dashboard-analytics`: Period-aware product sales summaries, rankings, and stock alerts for the company dashboard.

### Modified Capabilities

- None.

## Impact

- Adds a report/dashboard module and authenticated HTTP endpoint in the NestJS backend.
- Reads sales, sale items, products, and product specifications through bounded aggregate queries.
- May require database indexes for company, sale status, date, and sale-item joins after query-plan validation.
- Requires frontend integration with preset periods and a custom range picker, but does not change existing CRUD response contracts.
- Existing product and sales CRUD endpoints remain available for their current use cases.
