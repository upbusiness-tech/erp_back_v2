## Context

The backend is a NestJS application using TypeORM, PostgreSQL, authenticated company-scoped CRUD controllers, and `@dataui/crud`. Product statistics currently include a regular SQL view that groups historical sale items by product specification, but it has no period parameter and is not a complete contract for the cards and rankings in the dashboard. Existing product and sale CRUD routes also eager-load relationships that are inappropriate for an analytics payload.

## Goals / Non-Goals

**Goals:**

- Add a dedicated authenticated report endpoint for the product dashboard.
- Keep the response small and stable regardless of the number of historical sales.
- Push filtering, aggregation, ranking, and limits into PostgreSQL.
- Use the company token as the authoritative tenant boundary.
- Make date handling, empty results, stock alerts, and ranking limits testable.
- Leave existing CRUD routes and their response contracts unchanged.

**Non-Goals:**

- Replacing the existing product or sale CRUD APIs.
- Returning time-series charts or raw sale records.
- Introducing a general-purpose reporting query language.
- Adding a new cache infrastructure before query performance is measured.
- Building a materialized summary table in the first implementation.

## Decisions

### Dedicated report module

Place the endpoint in a report/dashboard module rather than in the product CRUD service. The dashboard combines sales, sale items, product specifications, products, and stock state, so treating it as a product CRUD operation would blur ownership and encourage eager-loading existing product relations.

Alternatives considered:

- Extending `/product/top-selling`: rejected because that route cannot cleanly represent all dashboard sections and already depends on a history-wide view.
- Creating several product endpoints: rejected because the frontend would issue multiple requests and duplicate authorization, date normalization, and aggregation work.

### One dashboard contract with bounded aggregate queries

Expose one endpoint such as `GET /report/product-dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=5`. The service may use several focused aggregate queries or CTEs, but the HTTP response is one compact DTO containing summary metrics and four bounded rankings. Queries must select scalar fields only and must not load entity relations.

The date range is normalized to a half-open timestamp interval using the company timezone: the start of `from` is included and the start of the day after `to` is excluded. This avoids end-of-day precision bugs while preserving inclusive date semantics for the client.

### Historical sales and metric definitions

Use completed, non-deleted sales and non-deleted sale items. Revenue is based on `quantitySold * salePriceSnapshot`, preserving the price at the time of sale rather than the current product price.

The initial turnover ranking uses the existing dashboard interpretation: period quantity sold divided by the current available stock, with a minimum denominator of one to keep zero-stock products finite and rankable. The initial urgent-restock threshold is 5 available units, represented as a backend setting so it can be changed without changing the response contract. The implementation must preserve deterministic tie-breaking. If inventory history becomes a reporting requirement, turnover can later move to an inventory-summary model without changing the rest of the response contract.

### Limit and validation policy

Use a small default ranking limit, such as 5, and enforce a hard maximum, such as 10. Validate `from`, `to`, and `limit` before building database queries. A maximum date span, initially one year, prevents accidental all-history scans from the interactive dashboard.

### Caching and database tuning

Add a short-lived cache only after the aggregate queries are measured. The cache key must include company, normalized `from`, normalized `to`, and limit. Before adding indexes, inspect query plans and add indexes that support company/status/date filtering and sale-item joins. The first implementation uses current transactional tables; a daily product-sales summary table is a later scaling path if query plans or latency show that direct aggregation is no longer sufficient.

### Authorization

Protect the route with the same employee authentication and permission model used by product reporting. Company scope must be applied inside the service query, not inferred from a client-supplied company identifier. The request must not expose a company filter parameter.

## Risks / Trade-offs

- [Risk] Direct aggregation becomes slow for companies with a very large sale history. -> [Mitigation] Enforce a maximum date range, inspect `EXPLAIN ANALYZE`, add targeted indexes, use short-lived caching, and introduce daily summaries when justified.
- [Risk] Current stock is not a historical stock value, so turnover for past periods is an approximation. -> [Mitigation] Document the initial formula and keep the response metric isolated so it can later use inventory history.
- [Risk] Cache data may briefly lag after a sale or cancellation. -> [Mitigation] Use a short TTL and invalidate affected company-period keys when reliable domain events are available.
- [Risk] Multiple rankings can accidentally use different filters or date boundaries. -> [Mitigation] Centralize normalization and common eligible-sale predicates in the dashboard service/query builder and test all sections against the same fixture.
- [Risk] Existing uncommitted product changes may alter available views or permissions during implementation. -> [Mitigation] Review the working tree before applying tasks and avoid overwriting unrelated changes.

## Migration Plan

1. Add the module, DTOs, service, controller, response types, and tests without changing existing routes.
2. Validate aggregate query plans against representative company data and add only justified indexes through a migration.
3. Deploy the endpoint and connect the frontend presets/custom range picker to it.
4. Enable short-lived caching after observing request volume and latency.
5. Roll back by removing the new route/module and any optional cache or index migration; existing CRUD endpoints remain available.
