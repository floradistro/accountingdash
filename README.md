# Flora Distribution Accounting Dashboard

Enterprise-grade accounting analytics platform built with Next.js 16, TypeScript, and Supabase.

## Features

### Analytics & Reporting
- **Real-time Dashboard** - Revenue, profit, and performance metrics
- **Revenue Analytics** - Detailed revenue tracking with WoW/MoM/YoY comparisons
- **Profit & Loss** - Comprehensive P&L statements with margin analysis
- **Staff Performance** - Employee performance tracking and leaderboards
- **Audit Management** - Cash audit tracking with discrepancy detection
- **Multi-Store Support** - Filter data across stores and locations

### Enterprise Capabilities
- **Service Layer Architecture** - Clean separation of concerns
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Result types with comprehensive error tracking
- **Monitoring** - Sentry integration for error tracking and performance monitoring
- **Analytics Engine** - Trend analysis, statistical comparisons, and forecasting
- **Structured Logging** - Comprehensive observability

### User Experience
- **Smooth Animations** - Framer Motion-powered transitions
- **Toast Notifications** - Real-time feedback system
- **Skeleton Loading** - Professional loading states
- **Dark Mode** - Elegant dark UI with glass morphism
- **Responsive Design** - Works on all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x
- **Database**: Supabase (PostgreSQL)
- **UI**: React 19, Framer Motion
- **Charts**: Recharts
- **State**: Zustand
- **Monitoring**: Sentry
- **Testing**: Jest (coming soon)

## Architecture

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
│   ├── analytics/    # Analytics components (trends, comparisons)
│   ├── charts/       # Chart components (Recharts)
│   ├── layout/       # Layout components (sidebar, header)
│   └── ui/           # UI primitives (buttons, cards, toast)
├── lib/              # Core utilities
│   ├── analytics/    # Analytics engine (trends, forecasting)
│   ├── monitoring/   # Error reporting (Sentry)
│   ├── services/     # Data access layer (BaseService)
│   └── supabase/     # Database client
└── stores/           # Zustand state management
```

## Database Schema

### Core Tables
- `orders` - Order transactions
- `order_items` - Line items
- `products` - Product catalog
- `stores` - Store locations
- `pickup_locations` - Distribution locations
- `cash_audits` - Cash audit records

### Analytics Views
- `v_daily_sales` - Aggregated daily sales metrics
- `v_staff_performance` - Employee performance metrics
- `v_staff_leaderboard` - Top performer rankings
- `v_staff_daily_performance` - Daily staff metrics
- `v_audit_summary` - Audit discrepancy tracking

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Sentry account (optional, for monitoring)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd newdash
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn (optional)
```

4. Run database migrations:
```bash
# See docs/database-setup.md for SQL migration scripts
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Development

### Project Structure

**Pages:**
- `/` - Main dashboard
- `/revenue` - Revenue analytics
- `/pnl` - Profit & Loss
- `/staff` - Staff performance
- `/audits` - Cash audits
- `/ar`, `/ap`, `/cash`, `/safe`, `/inventory` - Coming soon

**Services:**
Service layer pattern for data access:
```typescript
// Example: Using the staff analytics service
import { staffAnalyticsService } from '@/lib/services/staff-analytics.service'

const result = await staffAnalyticsService.getStaffPerformance({ storeId })
if (result.ok) {
  const data = result.value
}
```

**Error Handling:**
Result type pattern for type-safe error handling:
```typescript
import { Result } from '@/lib/result'

function riskyOperation(): Result<Data, Error> {
  try {
    return success(data)
  } catch (err) {
    return failure(new Error('Failed'))
  }
}
```

**Monitoring:**
```typescript
import { reportError, addBreadcrumb } from '@/lib/monitoring/error-reporter'

try {
  await riskyOperation()
} catch (error) {
  reportError(error, {
    feature: 'dashboard',
    action: 'load-metrics',
    userId: user.id
  })
}
```

**Toast Notifications:**
```typescript
import { toast } from '@/components/ui/toast'

toast.success('Saved successfully!')
toast.error('Failed to save', 'Please try again')
toast.warning('Low inventory detected')
toast.info('New data available')
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (coming soon)
- **Linting**: ESLint (coming soon)
- **Components**: Functional components with hooks
- **State**: Zustand stores for global state
- **Styling**: Inline styles (considering Tailwind migration)

## Analytics Features

### Trend Analysis
Statistical trend detection with direction, strength, and velocity:
```typescript
import { analyzeTrend } from '@/lib/analytics/trend-analysis'

const trend = analyzeTrend([100, 110, 105, 120, 130])
// Returns: { direction: 'up', strength: 'strong', velocity: 7.5 }
```

### Comparisons
Week-over-week, month-over-month, year-over-year:
```typescript
import { compareWoW, compareMoM, compareYoY } from '@/lib/analytics/comparisons'

const wow = compareWoW(dailyData)
// Returns: { period: 'Week over Week', current: 1000, previous: 900, change: 11.1 }
```

### Forecasting
Moving average and linear regression:
```typescript
import { simpleMovingAverage, linearForecast } from '@/lib/analytics/forecasting'

const forecast = linearForecast(historicalData, 7) // 7-day forecast
```

## Monitoring & Observability

### Error Tracking
Sentry integration with automatic error capture:
- Client-side errors
- Server-side errors
- API errors
- Database errors

### Logging
Structured logging with log levels:
```typescript
import { createLogger } from '@/lib/logger'

const logger = createLogger('MyFeature')
logger.info({ action: 'user-login', userId: '123' })
logger.error({ action: 'api-call', error: err.message })
```

### Performance Monitoring
- Page load times
- API response times
- Database query performance
- Real user monitoring (RUM)

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
# Build
docker build -t newdash .

# Run
docker run -p 3000:3000 newdash
```

### Environment Variables
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `NEXT_PUBLIC_SENTRY_DSN` - Error monitoring
- `NEXT_PUBLIC_APP_VERSION` - Release tracking

## Testing

Coming soon:
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- 80% code coverage target

## Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Dashboard with core metrics
- [x] Revenue analytics
- [x] P&L reporting
- [x] Staff performance
- [x] Audit tracking
- [x] Service layer architecture
- [x] Analytics engine

### Phase 2: Polish (✅ Complete)
- [x] Animations & transitions
- [x] Toast notifications
- [x] Skeleton loading states
- [x] Error monitoring (Sentry)
- [x] Documentation

### Phase 3: Enterprise Features (In Progress)
- [ ] Testing framework (Jest + 80% coverage)
- [ ] RBAC (Role-based access control)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Advanced caching (Redis)
- [ ] Rate limiting
- [ ] Audit trail
- [ ] Data export (CSV/Excel/PDF)

### Phase 4: AI/ML Features
- [ ] Demand forecasting
- [ ] Anomaly detection
- [ ] Customer segmentation
- [ ] Inventory optimization
- [ ] Price optimization
- [ ] Fraud detection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - Flora Distribution

## Support

For questions or issues:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

## Performance

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: 95+
- **Bundle Size**: < 300KB (gzipped)

## Security

- Row-Level Security (RLS) on database
- Service role for analytics (bypasses RLS with app-level filtering)
- Environment variables for secrets
- HTTPS only in production
- Content Security Policy (CSP)
- No sensitive data in client logs

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Monitored with [Sentry](https://sentry.io/)
