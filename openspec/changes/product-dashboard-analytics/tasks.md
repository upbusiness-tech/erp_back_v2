## 1. Contract And Configuration

- [x] 1.1 Define the dashboard query DTO for `from`, `to`, and optional `limit`, including date-only parsing, maximum range, default limit, and hard limit constants.
- [x] 1.2 Define the dashboard response types for summary metrics, featured product, and the four bounded rankings.
- [x] 1.3 Define the configurable urgent-restock threshold with an initial default of 5 available units and document the turnover formula and deterministic tie-breaking.

## 2. Module And Authorization

- [x] 2.1 Create the dedicated product dashboard/report module and register it in the application module.
- [x] 2.2 Add an authenticated controller route for `GET /report/product-dashboard` using the employee guard and the appropriate reporting permission.
- [x] 2.3 Ensure company scope is taken from the authenticated token and that no client-supplied company identifier is accepted.

## 3. Dashboard Aggregation

- [x] 3.1 Implement shared date normalization to an inclusive client range and half-open database timestamp interval using the company timezone.
- [x] 3.2 Implement the eligible-sales predicate for company, completed status, non-deleted sales, and non-deleted sale items.
- [x] 3.3 Implement bounded aggregation for total units, total revenue, featured product, and no-stock count using sale price snapshots.
- [x] 3.4 Implement the best-selling, highest-revenue, highest-turnover, and urgent-restock rankings with scalar projections, server-side ordering, deterministic ties, and limits.
- [x] 3.5 Return the documented zero-value and empty-array response for periods with no eligible product sales.

## 4. Validation And Resource Protection

- [x] 4.1 Reject malformed or missing dates, reversed ranges, future dates, ranges over the maximum span, invalid limits, and non-finite query values before database access.
- [x] 4.2 Enforce the default and maximum ranking limits in the service even when the HTTP query parser is bypassed.
- [x] 4.3 Confirm all dashboard queries select only required scalar fields and do not eager-load product, sale, or specification relations.

## 5. Tests

- [x] 5.1 Add unit tests for date normalization, inclusive boundaries, maximum range, limit handling, and invalid input errors.
- [x] 5.2 Add service/query tests covering completed versus non-completed sales, soft-deleted records, price snapshots, empty periods, stock threshold, and turnover with zero stock.
- [x] 5.3 Add authorization and integration tests proving company isolation and rejection of unauthenticated requests.
- [x] 5.4 Add response-shape tests proving one response contains summary data and all bounded rankings without raw sale records.

## 6. Query Performance And Delivery

- [x] 6.1 Run `EXPLAIN ANALYZE` for representative company data and record the query plans and latency for each aggregate path.
- [ ] 6.2 Add a database migration only for indexes justified by the measured plans, then verify the migration and rollback behavior.
- [x] 6.3 Measure repeated dashboard requests and, if justified, add short-lived caching keyed by company, normalized date range, and limit.
- [x] 6.4 Document the endpoint contract, frontend period presets, custom range semantics, response examples, and the current stock-based turnover limitation.
- [x] 6.5 Run the relevant test suite, build, lint, and OpenSpec validation before handing the endpoint to frontend integration.
