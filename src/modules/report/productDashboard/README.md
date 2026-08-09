# Product Dashboard API

## Request

```http
GET /report/product-dashboard?from=2026-08-01&to=2026-08-31&limit=5
```

`from` and `to` use `YYYY-MM-DD` and are inclusive. The backend normalizes the database interval to `[from 00:00:00, day after to 00:00:00)`, using UTC until a company timezone is introduced. The maximum range is 366 days. `limit` defaults to 5 and cannot exceed 10.

The frontend can expose these presets using the same request contract:

- Hoje
- Esta semana
- Este mês
- Últimos 7 dias
- Últimos 30 dias
- Últimos 90 dias
- Personalizado, using a range date picker

## Response

```json
{
  "period": { "from": "2026-08-01", "to": "2026-08-31" },
  "summary": {
    "unitsSold": 460,
    "revenue": 66584,
    "featuredProduct": {},
    "zeroStockProducts": 2
  },
  "rankings": {
    "bestSelling": [],
    "highestRevenue": [],
    "highestTurnover": [],
    "urgentRestock": []
  }
}
```

All rankings are server-limited. They use completed, non-deleted sales from the authenticated company. Revenue uses `salePriceSnapshot`. Initial turnover is period quantity sold divided by current available stock, with a minimum denominator of one. The initial urgent-restock threshold is 5 available units.
