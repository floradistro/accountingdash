# React PDF - Complete Explanation

## 🎯 How It Works - Step by Step

### The Magic: JSX → PDF

React PDF is like a **virtual DOM for PDFs**. Instead of rendering to HTML/DOM, it renders to PDF format.

```typescript
// You write this (JSX - looks like HTML):
<View style={{ padding: 20 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Hello World</Text>
</View>

// React PDF converts it to this (PDF instructions):
// "Draw a rectangle at x:20, y:20"
// "Set font to bold, size 24"
// "Write 'Hello World' at x:20, y:40"
```

### Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENT                                               │
│    User clicks "Export PDF"                             │
│    ↓                                                     │
│    Send report data to /api/reports/pdf                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. SERVER (Next.js API Route)                           │
│    Receive report data                                  │
│    ↓                                                     │
│    Create React element:                                │
│    React.createElement(ReportDocument, { data })        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. REACT PDF RENDERER                                   │
│    Parse JSX tree:                                      │
│    <Document>                                           │
│      <Page>                                             │
│        <View> ... </View>                               │
│      </Page>                                            │
│    </Document>                                          │
│    ↓                                                     │
│    Calculate layout (Flexbox engine)                    │
│    ↓                                                     │
│    Apply styles (StyleSheet)                            │
│    ↓                                                     │
│    Render to PDF instructions                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. PDF ENGINE (pdfkit under the hood)                   │
│    Convert to actual PDF binary format                  │
│    ↓                                                     │
│    Create PDF buffer in memory                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. RESPONSE                                             │
│    Send PDF buffer to client                            │
│    ↓                                                     │
│    Browser downloads the file                           │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Core Components

### 1. Document (Root Container)
```tsx
<Document>
  {/* All pages go here */}
</Document>
```
- Required root element
- Can contain multiple pages
- Like `<html>` in HTML

### 2. Page (PDF Page)
```tsx
<Page size="A4" orientation="portrait" style={styles.page}>
  {/* Page content */}
</Page>
```
- Represents one PDF page
- Can specify size: A4, Letter, Legal, or custom [width, height]
- Can set orientation: portrait or landscape

### 3. View (Container/Div)
```tsx
<View style={styles.container}>
  {/* Content */}
</View>
```
- Like `<div>` in HTML
- Can contain other Views or Text
- Supports Flexbox layout

### 4. Text (Text Content)
```tsx
<Text style={styles.text}>Hello World</Text>
```
- Like `<span>` or `<p>` in HTML
- Can only contain strings or Text elements
- Supports text styling

### 5. Image (Pictures)
```tsx
<Image src="/path/to/image.png" style={styles.image} />
```
- Embed images (local or URL)
- Supports PNG, JPG, WebP

### 6. Link (Hyperlinks)
```tsx
<Link src="https://example.com">Click here</Link>
```
- Creates clickable links in PDF

## 🎨 Styling System

### StyleSheet (Like CSS)
```tsx
import { StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',  // Flexbox!
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
})

// Use it:
<View style={styles.container}>
  <Text style={styles.text}>Styled text</Text>
</View>
```

### Supported CSS Properties

**Layout (Flexbox)**
- `flexDirection`: 'row' | 'column'
- `justifyContent`: 'flex-start' | 'center' | 'space-between' | etc.
- `alignItems`: 'flex-start' | 'center' | 'flex-end' | 'stretch'
- `flex`: number
- `gap`: number

**Spacing**
- `margin`: number | `marginTop`, `marginRight`, etc.
- `padding`: number | `paddingTop`, `paddingRight`, etc.

**Typography**
- `fontSize`: number
- `fontWeight`: number | 'normal' | 'bold'
- `fontFamily`: string
- `color`: string (hex)
- `textAlign`: 'left' | 'center' | 'right'
- `textTransform`: 'uppercase' | 'lowercase' | 'capitalize'
- `letterSpacing`: number

**Borders & Background**
- `backgroundColor`: string (hex)
- `border`: 'width solid color'
- `borderRadius`: number
- `borderTop`, `borderBottom`, etc.

**Sizing**
- `width`: number | percentage string
- `height`: number | percentage string
- `minWidth`, `maxWidth`, `minHeight`, `maxHeight`

## 💡 Can It Be Used for Anything?

### ✅ YES! Perfect For:

**1. Reports & Analytics**
```tsx
<Document>
  <Page>
    <View style={styles.header}>
      <Text>Monthly Sales Report</Text>
    </View>

    <View style={styles.chart}>
      {/* Table with sales data */}
    </View>

    <View style={styles.summary}>
      <Text>Total: $1,234,567</Text>
    </View>
  </Page>
</Document>
```

**2. Invoices**
```tsx
<Document>
  <Page>
    <View style={styles.invoiceHeader}>
      <Image src="/logo.png" />
      <Text>Invoice #12345</Text>
    </View>

    <View style={styles.billTo}>
      <Text>Bill To: John Doe</Text>
      <Text>123 Main St</Text>
    </View>

    <View style={styles.itemsTable}>
      {items.map(item => (
        <View style={styles.row}>
          <Text>{item.name}</Text>
          <Text>{item.price}</Text>
        </View>
      ))}
    </View>

    <View style={styles.total}>
      <Text>Total: ${total}</Text>
    </View>
  </Page>
</Document>
```

**3. Receipts**
```tsx
<Document>
  <Page size={[80, 200]} style={styles.receipt}>
    <Text style={styles.storeName}>Your Store</Text>
    <Text style={styles.date}>{date}</Text>

    {items.map(item => (
      <View style={styles.item}>
        <Text>{item.name}</Text>
        <Text>${item.price}</Text>
      </View>
    ))}

    <View style={styles.total}>
      <Text>TOTAL: ${total}</Text>
    </View>
  </Page>
</Document>
```

**4. Certificates**
```tsx
<Document>
  <Page orientation="landscape" size="A4">
    <View style={styles.border}>
      <Text style={styles.title}>Certificate of Achievement</Text>
      <Text style={styles.name}>{name}</Text>
      <Text>For completing {course}</Text>
      <Image src="/signature.png" />
    </View>
  </Page>
</Document>
```

**5. Labels & Badges**
```tsx
<Document>
  <Page size={[100, 50]}>
    <View style={styles.label}>
      <Text>{productName}</Text>
      <Image src={barcode} />
      <Text>{price}</Text>
    </View>
  </Page>
</Document>
```

**6. Letters & Documents**
```tsx
<Document>
  <Page>
    <View style={styles.letterhead}>
      <Image src="/logo.png" />
      <Text>Company Name</Text>
    </View>

    <View style={styles.date}>
      <Text>{date}</Text>
    </View>

    <View style={styles.body}>
      <Text>Dear {recipient},</Text>
      <Text>{content}</Text>
      <Text>Sincerely,</Text>
      <Text>{sender}</Text>
    </View>
  </Page>
</Document>
```

**7. Tickets**
```tsx
<Document>
  <Page size={[200, 100]}>
    <View style={styles.ticket}>
      <Text style={styles.eventName}>{event}</Text>
      <Text>{date} - {time}</Text>
      <Text>Seat: {seat}</Text>
      <Image src={qrCode} />
    </View>
  </Page>
</Document>
```

**8. Multi-Page Documents**
```tsx
<Document>
  <Page size="A4">
    <Text>Page 1 - Cover</Text>
  </Page>

  <Page size="A4">
    <Text>Page 2 - Table of Contents</Text>
  </Page>

  <Page size="A4">
    <Text>Page 3 - Content</Text>
  </Page>

  {/* Dynamic pages */}
  {chapters.map((chapter, i) => (
    <Page key={i} size="A4">
      <Text>{chapter.title}</Text>
      <Text>{chapter.content}</Text>
    </Page>
  ))}
</Document>
```

### ❌ Not Great For:

**1. Interactive PDFs**
- No form inputs
- No JavaScript
- No interactive charts (can include static chart images though)

**2. Complex Graphics**
- No SVG support (can convert to PNG first)
- No canvas drawing
- Limited graphical capabilities

**3. Heavy Text Editing**
- No WYSIWYG editing
- Best for **generating** PDFs, not editing them

## 🎯 Real-World Examples in Your App

### Example 1: Chart of Accounts (COA) Report
```tsx
export const COADocument = ({ accounts }: { accounts: Account[] }) => (
  <Document>
    <Page size="A4">
      <View style={styles.header}>
        <Text style={styles.title}>Chart of Accounts</Text>
        <Text>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Account Code</Text>
          <Text style={styles.col2}>Account Name</Text>
          <Text style={styles.col3}>Type</Text>
          <Text style={styles.col4}>Balance</Text>
        </View>

        {accounts.map(account => (
          <View key={account.id} style={styles.tableRow}>
            <Text style={styles.col1}>{account.code}</Text>
            <Text style={styles.col2}>{account.name}</Text>
            <Text style={styles.col3}>{account.type}</Text>
            <Text style={styles.col4}>${account.balance.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)
```

### Example 2: Daily Sales Receipt
```tsx
export const DailySalesReceipt = ({ sales }: { sales: Sale[] }) => (
  <Document>
    <Page size="A4">
      <View style={styles.header}>
        <Text>Daily Sales Summary</Text>
        <Text>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricBox}>
          <Text style={styles.label}>Total Sales</Text>
          <Text style={styles.value}>
            ${sales.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.label}>Transactions</Text>
          <Text style={styles.value}>{sales.length}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.label}>Avg Transaction</Text>
          <Text style={styles.value}>
            ${(sales.reduce((sum, s) => sum + s.amount, 0) / sales.length).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        {sales.map(sale => (
          <View key={sale.id} style={styles.row}>
            <Text>{sale.time}</Text>
            <Text>{sale.items}</Text>
            <Text>${sale.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)
```

### Example 3: Staff Performance Report
```tsx
export const StaffPerformanceReport = ({ staff }: { staff: StaffMember[] }) => (
  <Document>
    {staff.map(member => (
      <Page key={member.id} size="A4">
        <View style={styles.header}>
          <Text style={styles.name}>{member.name}</Text>
          <Text>{member.role}</Text>
        </View>

        <View style={styles.kpis}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Sales</Text>
            <Text style={styles.kpiValue}>${member.totalSales}</Text>
          </View>

          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Hours</Text>
            <Text style={styles.kpiValue}>{member.hoursWorked}</Text>
          </View>

          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>$/Hour</Text>
            <Text style={styles.kpiValue}>
              ${(member.totalSales / member.hoursWorked).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.chart}>
          <Text>Performance Trend</Text>
          {/* Could embed a chart image here */}
          <Image src={member.chartUrl} />
        </View>
      </Page>
    ))}
  </Document>
)
```

## 🔥 Advanced Features

### 1. Dynamic Page Breaks
```tsx
<Document>
  <Page>
    {items.map((item, i) => (
      <View key={i} wrap={false}>  {/* Prevents breaking across pages */}
        <Text>{item.title}</Text>
        <Text>{item.description}</Text>
      </View>
    ))}
  </Page>
</Document>
```

### 2. Page Numbers
```tsx
<View style={styles.footer} fixed>
  <Text render={({ pageNumber, totalPages }) =>
    `Page ${pageNumber} of ${totalPages}`
  } />
</View>
```

### 3. Fixed Headers/Footers
```tsx
<Page>
  <View style={styles.header} fixed>
    <Text>This appears on every page</Text>
  </View>

  <View>
    {/* Page content */}
  </View>

  <View style={styles.footer} fixed>
    <Text>Footer on every page</Text>
  </View>
</Page>
```

### 4. Custom Fonts
```tsx
Font.register({
  family: 'MyFont',
  src: '/fonts/custom-font.ttf'
})

<Text style={{ fontFamily: 'MyFont' }}>Custom font text</Text>
```

### 5. Conditional Rendering
```tsx
{hasDiscount && (
  <View>
    <Text>Discount Applied: 20%</Text>
  </View>
)}

{items.length > 10 ? (
  <Text>Showing first 10 items...</Text>
) : (
  <Text>All items shown</Text>
)}
```

## ⚡ Performance Tips

**1. Server-Side Rendering** (What we do)
```tsx
// ✅ Good - Server generates PDF
const pdfBuffer = await renderToBuffer(<MyDocument />)

// ❌ Avoid - Client generates PDF (slower)
pdf(MyDocument).toBlob()
```

**2. Limit Data**
```tsx
// ✅ Good - Paginate or limit rows
const displayRows = rows.slice(0, 100)

// ❌ Avoid - Rendering thousands of rows
{rows.map(...)}  // If rows = 10,000
```

**3. Optimize Images**
```tsx
// ✅ Good - Compressed images
<Image src="/optimized-logo.png" />

// ❌ Avoid - Large uncompressed images
<Image src="/10mb-photo.jpg" />
```

## 🎯 Summary

**React PDF = React Components → PDF**

- **How**: JSX → Layout Engine → PDF Buffer
- **Where**: Server-side (fast, efficient)
- **What**: Reports, invoices, receipts, certificates, labels, letters, tickets
- **Why**: Declarative, maintainable, type-safe, professional

**Yes, it can be used for anything document-related!** 🚀

Your COA generation, sales reports, staff reports, invoices, receipts - all perfect use cases!
