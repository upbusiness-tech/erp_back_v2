# Sales Dashboard API

## Request

```http
GET /report/sales-dashboard?from=2026-08-01&to=2026-08-31&paymentType=PIX&paymentType=CREDITO&saleType=BALCAO&saleType=PDV&customerName=Maria&saleCode=123
```

`from` and `to` use `YYYY-MM-DD` and are inclusive. The backend uses a half-open database interval and rejects future ranges and ranges longer than 366 days.

`paymentType` and `saleType` may be repeated to send multiple values. Filters from different fields are combined with `AND`; values in each list use `IN` semantics.

## Response

```json
{
  "period": { "from": "2026-08-01", "to": "2026-08-31" },
  "filters": {
    "paymentType": ["PIX", "CREDITO"],
    "saleType": ["BALCAO", "PDV"],
    "customerName": "Maria",
    "saleCode": "123"
  },
  "summary": {
    "filteredSales": 5,
    "total": 2189.5
  },
  "paymentBreakdown": [
    { "type": "PIX", "amount": 689.9 },
    { "type": "CREDITO", "amount": 1259.7 }
  ]
}
```

Only completed, non-deleted sales from the authenticated company are included. When payment filters are present, a split-payment sale is selected if it has any selected payment type, but `summary.total` and `paymentBreakdown` include only selected payment amounts.

For cash (`DINHEIRO`), `sale_payments.amount` holds the tendered amount, including change. The sale-level `sales.change` is deducted from the cash aggregate once per sale, so cash and `summary.total` reflect the net received value.
