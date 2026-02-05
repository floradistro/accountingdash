# Enterprise Report System

A clean, backend-driven report generation system with dynamic query building.

## Architecture

### Backend-First Design
- **Query Builder Service** (`src/lib/reports/query-builder.ts` - 371 lines)
  - Dynamic SQL generation based on dimensions and metrics
  - Optimized data aggregation
  - Lookup resolution (stores, locations)
  - Smart formatting

- **API Endpoint** (`src/app/api/reports/query/route.ts` - 36 lines)
  - Simple POST endpoint
  - Query validation
  - Error handling

### Clean Frontend
- **Report Builder Component** (`src/components/reports/report-builder.tsx` - 307 lines)
  - Dimension selection (date, location, store, channel, payment method, order type)
  - Metric selection (orders, revenue, cost, profit, margin, tax, discounts, etc.)
  - Date granularity (day, week, month, quarter, year)
  - Results table with totals
  - CSV and PDF export

## Features

### Custom Dimensions
- **Date**: Group by time periods with configurable granularity
- **Location**: Group by store location
- **Store**: Group by store
- **Channel**: Online vs In-Store sales
- **Payment Method**: Cash, card, etc.
- **Order Type**: Walk-in, pickup, delivery, shipping

### Rich Metrics
- **Orders**: Number of orders
- **Revenue**: Total revenue
- **Cost (COGS)**: Cost of goods sold
- **Profit**: Revenue - Cost
- **Margin %**: Profit margin percentage
- **Tax**: Tax collected
- **Discounts**: Total discounts applied
- **Net Revenue**: Revenue - Discounts
- **Quantity**: Units sold
- **Avg Order Value**: Revenue / Orders

### Export Options
- **CSV**: Spreadsheet-compatible format
- **PDF**: Professional formatted reports

## Usage

1. **Select Dimensions**: Choose how to group your data
2. **Select Metrics**: Choose what to measure
3. **Configure Date Granularity**: If using date dimension
4. **Run Report**: Execute query on backend
5. **Export**: Download as CSV or PDF

## Technical Details

### Query Execution
1. Frontend sends dimensions + metrics to `/api/reports/query`
2. Backend builds optimized query using `v_daily_sales` view
3. Data is aggregated based on selected dimensions
4. Lookups are resolved (store names, location names)
5. Metrics are calculated (totals, averages, margins)
6. Results returned with totals and metadata

### Performance
- Limit: 10,000 rows max
- Query time: Typically <500ms
- Caching: None (real-time data)
- Optimization: Database views for pre-aggregation

## Comparison to Old System

### Old Analytics (floradistro/ANALYTICS)
- ❌ 1323-line monolithic component
- ❌ Client-side data processing
- ❌ Complex state management
- ❌ Mixed concerns (UI + logic)

### New System
- ✅ 307-line clean UI component
- ✅ Backend-driven query building
- ✅ Separation of concerns
- ✅ Scalable architecture
- ✅ Better performance

## Future Enhancements

- [ ] Report scheduling
- [ ] Email delivery
- [ ] Saved report templates
- [ ] Data visualization (charts)
- [ ] Advanced filters
- [ ] Drill-down capabilities
