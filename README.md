# Pipe Centre — Plumbing & Electrical Supplies Web App

A responsive web application designed for mobile-first customer browsing and comprehensive private back-office management. Built with **Next.js 14**, **Supabase (PostgreSQL + Auth + Storage)**, and **Tailwind CSS**.

---

## Architecture Overview

```
pipe-centre/
├── src/
│   ├── app/
│   │   ├── (customer facing)
│   │   │   ├── page.tsx                     # Home: hero, categories, featured, contact
│   │   │   ├── catalogue/
│   │   │   │   ├── page.tsx                 # Server page wrapper
│   │   │   │   ├── CatalogueClient.tsx      # Filter, search, sort, pagination
│   │   │   │   └── [slug]/page.tsx          # Product detail page
│   │   │   └── enquiry/
│   │   │       ├── page.tsx                 # Cart + submission + WhatsApp
│   │   │       └── confirmation/[ref]/      # Success page with reference
│   │   ├── admin/ (protected via middleware)
│   │   │   ├── login/page.tsx               # Staff & owner login
│   │   │   ├── page.tsx                     # Dashboard with metrics & alerts
│   │   │   ├── enquiries/                   # List & detail views with click-to-contact
│   │   │   ├── products/                    # Inventory CRUD, stock adjustment
│   │   │   ├── categories/                  # Category / subcategory tree
│   │   │   ├── stock/                       # Complete stock movement audit log
│   │   │   ├── import-export/               # Bulk CSV upload / download
│   │   │   └── users/                       # Staff management (owner only)
│   │   └── api/                             # Route handlers for CRUD & actions
│   ├── components/                          # UI components
│   └── lib/                                 # Types, Supabase client, utilities
└── supabase/
    ├── schema.sql                           # Full DB schema, RLS policies, functions
    └── seed.sql                             # 20 realistic products + categories
```

---

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Under **Project Settings → API**, copy:
   - `Project URL`
   - `anon public` key

### 2. Set Up the Database
1. In your Supabase dashboard, open the **SQL Editor**.
2. Run the entire contents of [`supabase/schema.sql`](file:///Users/vasudev/PipeCenter/pipe-centre/supabase/schema.sql).
3. Then run [`supabase/seed.sql`](file:///Users/vasudev/PipeCenter/pipe-centre/supabase/seed.sql) to populate categories and 20 sample products.

### 3. Create the First Admin (Owner)
1. In Supabase, go to **Authentication → Users** and click **Add User** (enter your email and a strong password).
2. Note the generated User `UUID`.
3. In the **SQL Editor**, run:
   ```sql
   insert into public.profiles (id, role, full_name)
   values ('YOUR-USER-UUID-HERE', 'owner', 'Shop Owner');
   ```

### 4. Configure Environment Variables
Create a `.env.local` file inside the `pipe-centre/` folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Shop Details (shown in customer UI)
NEXT_PUBLIC_SHOP_PHONE=+919876543210
NEXT_PUBLIC_SHOP_WHATSAPP=+919876543210
NEXT_PUBLIC_SHOP_ADDRESS="123 Main Street, Bengaluru, Karnataka 560001"
NEXT_PUBLIC_SHOP_HOURS="Mon–Sat: 9 AM – 7 PM | Sun: 10 AM – 4 PM"
```

### 5. Install Dependencies & Run
```bash
cd pipe-centre
npm install
npm run dev
```

Visit:
- Customer app: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin` (log in with your owner credentials)

---

## Features Implemented

### Part 1: Customer App (No Login)
- [x] **Home page**: Brand hero banner, category tiles, featured products grid, and shop contact details with click-to-call/WhatsApp.
- [x] **Catalogue**: Fast responsive product grid with:
  - Name and brand search
  - Category and sub-category filtering
  - Price ceiling filter
  - In-stock only toggle
  - Sorting (Price Low/High, Name A–Z)
  - Infinite/load-more pagination
- [x] **Product Detail**: Specs table, brand, unit, stock badge, high-res photos, and add-to-enquiry button.
- [x] **Enquiry Cart**: Persistent localStorage cart with quantity increment/decrement.
- [x] **Submission**: Generates unique reference code (`PC-YYYYMMDD-XXXX`), records enquiry and line items in Supabase.
- [x] **WhatsApp Deep-Link**: Pre-populates a formatted message with product names, quantities, and customer details.
- [x] **Confirmation**: Displays the reference number and quick follow-up action buttons.

### Part 2: Business Admin App (Login Required)
- [x] **Auth & Protection**: Next.js middleware guards all `/admin/*` routes; Supabase email/password authentication.
- [x] **Dashboard**: Live metric cards (New enquiries, total products, low-stock alerts, out-of-stock items), plus recent enquiries and stock warnings.
- [x] **Enquiry Management**: Status tabs (New → Contacted → Confirmed → Completed / Cancelled), internal notes field, click-to-call, click-to-WhatsApp.
- [x] **Auto Stock Deduction**: Marking an enquiry as `Completed` automatically decrements inventory and logs the stock movement.
- [x] **Inventory Management**: Full product CRUD with brand, unit, price ("Ask for price" supported), specifications key-value builder, and visibility toggles.
- [x] **Quick Stock Adjustment**: Modal to add/deduct stock per item with reason tracking.
- [x] **Category Management**: Tree view supporting top-level categories and subcategories with reordering.
- [x] **Stock History Log**: Complete audit trail showing who changed what, the quantity delta, date/time, and reason.
- [x] **Bulk Tools**:
  - Export full inventory to CSV.
  - Bulk import products from CSV with automatic category matching.
- [x] **Staff Management**: Owner can invite and remove staff members directly from the UI.
