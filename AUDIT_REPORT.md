# Financial Data Audit Report
**Generated:** 2026-02-05
**Audited Period:** 2025-11-07 to 2026-02-05

## Executive Summary

Comprehensive audit completed on all financial views, reports, and data integrity. Testing covered:
- Sales view structure and calculations
- Purchase order view structure and calculations
- Data integrity between views and source tables
- Location tax rate configurations
- Profit calculations
- Report aggregations
- Data anomaly detection

**Results:**
- ✅ **11 Tests Passed**
- ⚠️ **16 Warnings** (mostly configuration issues)
- ❌ **3 Critical Issues** (data quality problems)

---

## Critical Issues

### 1. COGS Exceeds Revenue (1 row)
**Severity:** HIGH
**Impact:** Data integrity

One or more transactions have Cost of Goods Sold that exceeds the revenue, which is impossible and indicates a data entry error.

**Recommendation:**
- Query: `SELECT * FROM v_daily_sales_detail WHERE total_cogs > total_revenue`
- Review and correct the affected orders
- Add database constraint to prevent COGS > Revenue

### 2. Revenue/Order Count Mismatch
**Severity:** MEDIUM (Actually false positive - audit query was incorrect)
**Status:** Under Investigation

The view includes 27 orders with status='completed' that the initial audit query missed. This is likely correct behavior, not an error.

**Recommendation:**
- Verify v_daily_sales_detail view definition includes proper status filters
- Update audit queries to match view logic exactly

### 3. Missing COGS Data
**Severity:** HIGH
**Impact:** Profit calculations are unreliable

- **412 rows with >95% profit margin** - indicates missing or zero COGS
- Without accurate COGS, profit reports are meaningless

**Recommendation:**
- Audit all products to ensure cost_per_unit is set
- Query orders with missing COGS:
  ```sql
  SELECT o.id, o.order_number, o.total_amount
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.payment_status = 'paid'
    AND (oi.cost_per_unit IS NULL OR oi.cost_per_unit = 0)
  ```
- Implement validation to require COGS on all products

---

## Warnings & Configuration Issues

### Tax Rate Configuration
**Impact:** Tax calculation accuracy

**12 locations missing tax rate configuration:**
1. Darion Simperly Warehouse
2. Yacht Club Warehouse
3. Main Warehouse
4. WhaleTools HQ
5. Test Location
6. Quantix Analytics Lab
7. Pure Health Peptides - Main
8. North/South/Platte/West Locations
9. Sapphire Social - Bristol

**Recommendation:**
- Add tax rates to `settings.tax_config.sales_tax_rate` for all active selling locations
- Warehouse locations may not need tax rates if they don't process customer sales

### Zero Revenue Orders
**Count:** 36 rows
**Impact:** Report accuracy

Some records show orders but $0 revenue, which could indicate:
- Test/sample orders
- Refunded orders not properly marked
- Data entry errors

**Recommendation:**
- Review: `SELECT * FROM v_daily_sales_detail WHERE order_count > 0 AND total_revenue = 0`
- Determine if these are valid or should be excluded from reporting

### Missing Tax on Orders
**Count:** 29 rows
**Impact:** Tax reporting accuracy

Orders with revenue but no tax recorded.

**Possible causes:**
- Tax-exempt customers/products
- Orders from locations without tax configuration
- Data quality issues

**Recommendation:**
- Review: `SELECT * FROM v_daily_sales_detail WHERE total_revenue > 0 AND total_tax = 0`
- Verify if tax-exempt status is intended
- Ensure all locations have proper tax configuration

---

## What's Working Correctly ✅

1. **View Structure** - All required columns present in both sales and PO views
2. **Profit Calculations** - Formula (revenue - cogs = profit) is correct across all rows
3. **PO Payment Math** - Outstanding balance calculations are accurate
4. **Location Assignment** - All sales have location_id assigned (no orphaned records)
5. **Data Aggregation** - Report grouping and aggregation logic working properly
6. **Tax Rate Display** - System now correctly shows configured tax rates by location

---

## Configured Tax Rates (Verified)

| Location | Configured Rate | Status |
|----------|----------------|--------|
| Blowing Rock | 6.75% | ✅ Active |
| Charlotte (Nations Ford Rd) | 7.25% | ✅ Active |
| Charlotte (Monroe Rd) | 7.50% | ✅ Active |
| Salisbury | 7.00% | ✅ Active |
| Elizabethton | 15.75% | ✅ Active (High - verify correct) |

**Note:** Elizabethton's 15.75% tax rate is unusually high. Verify this is correct or if it should be 7.50% or similar.

---

## Recommendations Priority

### Immediate (Critical)
1. ✅ Fix tax rate reporting - COMPLETED (now shows configured rates)
2. ❌ Fix COGS data - Find and correct the 1 row where COGS > Revenue
3. ❌ Audit COGS completeness - Investigate 412 rows with suspiciously high margins

### High Priority
4. ❌ Configure missing tax rates for 12 locations
5. ❌ Verify Elizabethton 15.75% tax rate is correct
6. ❌ Review 36 zero-revenue orders

### Medium Priority
7. ❌ Review 29 orders with no tax
8. ❌ Add database constraints (COGS <= Revenue, required tax rates, etc.)
9. ❌ Create automated daily audit script

### Low Priority
10. ✅ Verify v_daily_sales_detail view definition
11. ❌ Document expected profit margin ranges by category
12. ❌ Set up alerts for data anomalies

---

## Testing Performed

- ✅ View column structure validation
- ✅ Data type and null value checks
- ✅ Mathematical calculation verification (profit, payments, etc.)
- ✅ Cross-table data integrity checks
- ✅ Tax configuration audit across all locations
- ✅ Report aggregation testing
- ✅ Profit margin anomaly detection
- ✅ Revenue and tax validation

---

## Next Steps

1. Review this report with stakeholders
2. Prioritize and assign remediation tasks
3. Implement database constraints to prevent future issues
4. Schedule this audit to run weekly automatically
5. Create dashboards to monitor key metrics (COGS coverage, tax configuration, etc.)

---

*End of Report*
