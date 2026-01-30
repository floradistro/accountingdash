import { render, screen } from '@testing-library/react'
import { MetricCardSimple } from './metric-card-simple'

describe('MetricCardSimple', () => {
  it('should render label and value', () => {
    render(<MetricCardSimple label="Revenue" value="$1,234.56" />)

    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(
      <MetricCardSimple
        label="Revenue"
        value="$1,234.56"
        subtitle="10% increase"
      />
    )

    expect(screen.getByText('10% increase')).toBeInTheDocument()
  })

  it('should not render subtitle when not provided', () => {
    render(<MetricCardSimple label="Revenue" value="$1,234.56" />)

    expect(screen.queryByText(/increase/)).not.toBeInTheDocument()
  })

  it('should handle loading state (—)', () => {
    render(<MetricCardSimple label="Revenue" value="—" />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
