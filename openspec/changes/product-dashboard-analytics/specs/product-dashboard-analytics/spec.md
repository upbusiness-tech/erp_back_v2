## Purpose

Provide a bounded, period-aware analytics contract for the product dashboard so users can view sales and stock indicators without loading raw sales data into the frontend.

## ADDED Requirements

### Requirement: Dashboard accepts a validated date range

The system SHALL expose a product dashboard query that accepts `from` and `to` as date-only values in `YYYY-MM-DD` format. Both boundaries SHALL be inclusive, and the system SHALL reject malformed dates, a range where `from` is after `to`, ranges containing future dates, or ranges longer than the configured maximum period.

#### Scenario: Valid custom range
- **WHEN** an authenticated employee requests the dashboard with valid `from` and `to` dates
- **THEN** the system returns analytics calculated for the complete inclusive date range

#### Scenario: Invalid date range
- **WHEN** the request has a malformed date, a missing boundary, `from` after `to`, a future boundary, or an excessive range
- **THEN** the system returns a client validation error and does not execute dashboard aggregation queries

### Requirement: Dashboard data is isolated by company and sale status

The system SHALL calculate all dashboard values only from records belonging to the company in the authenticated token. Sales SHALL be included only when they are completed and not soft-deleted, and sale items used in calculations SHALL not be soft-deleted.

#### Scenario: Company-scoped dashboard
- **WHEN** an employee requests analytics
- **THEN** no product, stock, quantity, revenue, or ranking value from another company is included

#### Scenario: Non-completed sales are present
- **WHEN** pending, canceled, or other non-completed sales exist inside the requested period
- **THEN** their items do not contribute to summary values or rankings

### Requirement: Dashboard returns compact summary metrics

The system SHALL return a dashboard response containing total units sold, total revenue, the featured product, and the count of products requiring no-stock attention for the requested period. Monetary values SHALL use the historical sale price snapshot, and an empty period SHALL return zero values and null or empty optional sections rather than an error.

#### Scenario: Period has completed product sales
- **WHEN** the requested period contains completed sales with product items
- **THEN** the response contains the aggregated units and revenue plus the highest-ranked featured product

#### Scenario: Period has no completed product sales
- **WHEN** the requested period contains no eligible product items
- **THEN** the response returns zero totals, no featured product, and valid empty ranking arrays

### Requirement: Dashboard returns bounded product rankings

The system SHALL return rankings for best-selling products, highest-revenue products, highest-turnover products, and urgent-restock products. Each ranking SHALL be sorted by its metric, SHALL contain at most the requested limit, and SHALL apply a server-enforced maximum limit. Ranking entries SHALL include only the identifiers, display name, metric value, and stock data needed by the dashboard. The initial urgent-restock threshold SHALL be 5 available units and SHALL be represented as a backend-configurable value.

#### Scenario: Ranking limit is omitted
- **WHEN** a valid dashboard request does not provide a ranking limit
- **THEN** the system uses the documented default limit and never returns an unbounded ranking

#### Scenario: Ranking limit exceeds the maximum
- **WHEN** a request supplies a limit above the server maximum
- **THEN** the system rejects the value or clamps it according to the documented API behavior, without executing an unbounded query

#### Scenario: Product has zero stock
- **WHEN** a product qualifies for urgent restock because its available stock is at or below the configured threshold
- **THEN** it can appear in the urgent-restock ranking and the turnover calculation does not produce a division-by-zero or non-finite value

### Requirement: Dashboard uses one consistent query contract

The system SHALL return summary metrics and all rankings for the same normalized company, date range, and limit in one dashboard response. The endpoint SHALL not require the frontend to retrieve raw sales, sale items, or complete product collections to render the dashboard.

#### Scenario: Frontend loads the dashboard
- **WHEN** the frontend requests a valid period
- **THEN** one dashboard response supplies all sections needed for the statistics screen

#### Scenario: Repeated request for the same period
- **WHEN** the same company requests the same normalized period and limit within the configured cache window
- **THEN** the response remains consistent with the dashboard contract and can be served from a short-lived cache without changing its contents
