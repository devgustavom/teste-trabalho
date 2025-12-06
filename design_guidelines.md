# Central de Compras - Design Guidelines

## Design Approach

**Selected Approach:** Design System with B2B E-commerce References

**Rationale:** Given the platform serves users with low technological familiarity in a B2B context, we'll draw from proven B2B platforms (Shopify Admin, Faire, Ordermark) combined with simplified consumer e-commerce patterns. The design prioritizes clarity, familiarity, and reduced cognitive load over visual flair.

**Key Principles:**
- Extreme clarity over cleverness
- Generous spacing to reduce overwhelm
- Familiar e-commerce patterns adapted for B2B
- Clear visual role differentiation
- Prominent CTAs and status indicators

## Typography

**Font Family:** Inter (via Google Fonts CDN) - exceptional legibility at all sizes
- **Headings:** 600-700 weight
- **Body:** 400 weight
- **Emphasis/Labels:** 500 weight

**Scale:**
- Page titles: text-3xl (30px)
- Section headers: text-xl (20px)
- Card titles: text-lg (18px)
- Body text: text-base (16px)
- Labels/meta: text-sm (14px)
- Small print: text-xs (12px)

**Critical:** Maintain minimum 16px body text for accessibility and users with low tech familiarity.

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (within grouped elements)
- Standard spacing: p-4, gap-4 (cards, form fields)
- Section spacing: p-6 to p-8 (between major sections)
- Page padding: p-8 to p-12 (outer containers)
- Generous breathing room: gap-12 to gap-16 (between distinct content blocks)

**Grid System:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Product listings: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Forms: Single column, max-w-2xl for readability
- Data tables: Full-width with horizontal scroll on mobile

## Component Library

### Navigation
**Admin/Supplier/Retailer Dashboards:**
- Left sidebar navigation (280px) with clear role indicator at top
- Large, obvious icons from Heroicons paired with text labels
- Active state with background fill and bold text
- Collapsible on mobile to hamburger menu

**Top Bar:**
- Right-aligned user profile, notifications, logout
- Breadcrumbs for deep navigation
- Search when applicable

### Campaign Banners (Critical Feature)
**Home Screen Banners:**
- Full-width carousel or 2-column grid
- Minimum height: 240px on desktop, 180px on mobile
- Banner images with subtle overlay for text readability
- CTAs with blur backdrop (backdrop-blur-sm bg-white/80)
- Clear campaign end date and goal progress indicators

### E-commerce Order Interface (Most Critical)
**Product Grid:**
- 3-4 columns on desktop, 2 on tablet, 1 on mobile
- Each card: product image (square aspect ratio), title, price, stock indicator, quantity input, add to cart
- Image hover: scale transform with cursor zoom icon
- Click for lightbox/modal with larger image view

**Order Totalizer:**
- Sticky footer bar (fixed bottom-0) on mobile
- Sidebar card (sticky top-20) on desktop
- Large, bold total amount
- Breakdown: subtotal, conditions applied, estimated cashback
- Prominent "Submit Order" CTA

**Pre-submission Form:**
- Modal overlay before final submission
- Radio buttons for "Cash Payment" vs credit terms
- Checkbox for "Budget Only" flag
- Textarea for notes (minimum 3 rows visible)
- Clear submit and cancel actions

### Forms
**Standard Form Pattern:**
- Single column, left-aligned labels above inputs
- Input height: h-12 (generous touch targets)
- Clear focus states with border highlight
- Helper text below fields in muted color
- Grouped related fields with subtle background card

### Data Tables
**Order History / Product Management:**
- Alternating row backgrounds for scannability
- Status badges (rounded-full px-3 py-1) with semantic colors
- Action buttons right-aligned, icon + text
- Expandable rows for order details
- Pagination or infinite scroll for long lists

### Cards
**Supplier Cards / Campaign Cards:**
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-sm hover:shadow-md transition)
- Image at top (aspect-video or aspect-square)
- Title, description, metadata stacked below
- Footer with CTAs or status indicators

### File Upload/Download
**Supplier File Management:**
- Drag-and-drop zone with clear instructions
- File list with icon by type (PDF, Excel, Image)
- Download button with file size display
- Delete action for suppliers (with confirmation)

### Buttons
**Primary CTA:** Solid background, bold text, generous padding (px-6 py-3)
**Secondary:** Outline style with border
**Tertiary:** Text only with underline on hover
**Danger:** Red variant for destructive actions

## Responsive Breakpoints

- **Mobile:** < 640px (sm) - Single column, stacked navigation
- **Tablet:** 640-1024px (md-lg) - 2 columns where appropriate
- **Desktop:** > 1024px (lg+) - Full layout with sidebar, multi-column grids

## Accessibility

- All interactive elements minimum 44x44px touch target
- Form inputs properly associated with labels
- Status messages announced to screen readers
- Keyboard navigation for all actions
- High contrast text (minimum WCAG AA)

## Images

**Hero Images:** Not applicable for this B2B dashboard application - focus on functional dashboards

**Product Images:** User-uploaded, square thumbnails in grids, lightbox on click with 4:3 or 16:9 aspect for detail view

**Campaign Banners:** User/supplier uploaded, 16:9 landscape format, compressed for performance

**File Icons:** Use Heroicons for document types (DocumentTextIcon for PDF, TableCellsIcon for Excel, PhotoIcon for images)

## Key UX Patterns

- **Role-Based Dashboards:** Each user type sees only relevant actions
- **Progressive Disclosure:** Show summary first, details on demand
- **Confirmation Modals:** For all destructive or irreversible actions
- **Inline Editing:** Where appropriate for quick updates
- **Clear Empty States:** Helpful guidance when no data exists
- **Loading States:** Skeleton screens for data-heavy views