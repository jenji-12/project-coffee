
# Waibon POS — Reports & Dashboard + Storage Policies + Drag-n-drop Crop
Generated: 2025-10-09T06:08:37
test trigger 2025-10-29 02:30

## What this package adds
1) **Dashboard (charts)** using Chart.js
2) **Reports API**: CSV + PDF (sales by day, product mix, members)
3) **Advanced Supabase Storage policies** (public read, write via service role, scoped bucket rules)
4) **Image Drag-n-drop + Square Crop** component + **base64 upload API**

## Install
1. Merge this package into your project root (app/, components/, db/...). Allow overwrite if prompted.
2. Add dependencies:
   ```bash
   npm i chart.js pdfkit
   ```
3. Ensure `.env.local` has Supabase keys (service role required for reports/storage upload).
4. Apply storage policies in Supabase SQL Editor: `db/storage_policies.sql`
5. Use Dashboard: `/(back)/dashboard?shop=<SHOP_ID>`
6. Use Reports:
   - CSV: `/api/reports/sales/csv?shop=<SHOP_ID>`
   - PDF: `/api/reports/sales/pdf?shop=<SHOP_ID>`
   - Product mix CSV: `/api/reports/product-mix/csv?shop=<SHOP_ID>`
   - Members CSV: `/api/reports/members/csv?shop=<SHOP_ID>`
7. Image crop uploader:
   - Component: `components/Upload/ImageDropCrop.tsx`
   - API: `POST /api/storage/upload-product-base64` (fields: shop, productId, dataUrl)

