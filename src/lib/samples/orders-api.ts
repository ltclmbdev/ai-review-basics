import type { Sample } from './types'

export const ordersApiSample: Sample = {
  id: 'orders-api',
  name: 'Paginated orders (route handler + client)',
  seededBugs: [
    'Off-by-one in pagination: pages are 1-based but skip is page * PAGE_SIZE, so page 1 skips the first 20 orders',
    'The fetch promise chain in OrderList has no catch, so a failed request is an unhandled rejection and the list stays on "Loading" forever',
  ],
  diff: `diff --git a/src/app/api/orders/route.ts b/src/app/api/orders/route.ts
new file mode 100644
index 0000000..d353ad5
--- /dev/null
+++ b/src/app/api/orders/route.ts
@@ -0,0 +1,25 @@
+import { NextResponse } from 'next/server'
+
+import { db } from '@/lib/db'
+
+const PAGE_SIZE = 20
+
+export async function GET(request: Request) {
+  const { searchParams } = new URL(request.url)
+  const page = Math.max(1, Number(searchParams.get('page')) || 1)
+
+  const [orders, total] = await Promise.all([
+    db.order.findMany({
+      orderBy: { createdAt: 'desc' },
+      skip: page * PAGE_SIZE,
+      take: PAGE_SIZE,
+    }),
+    db.order.count(),
+  ])
+
+  return NextResponse.json({
+    orders,
+    page,
+    totalPages: Math.ceil(total / PAGE_SIZE),
+  })
+}
diff --git a/src/components/order-list.tsx b/src/components/order-list.tsx
index dc7a5ff..02b9230 100644
--- a/src/components/order-list.tsx
+++ b/src/components/order-list.tsx
@@ -1,20 +1,64 @@
+'use client'
+
+import { useEffect, useState } from 'react'
+
+import { Button } from '@/components/ui/button'
+
 type Order = {
   id: string
   total: number
   createdAt: string
 }
 
-type OrderListProps = {
+type OrdersResponse = {
   orders: Order[]
+  page: number
+  totalPages: number
 }
 
-export const OrderList = ({ orders }: OrderListProps) => (
-  <ul className="divide-y">
-    {orders.map((order) => (
-      <li key={order.id} className="flex justify-between py-2">
-        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
-        <span>\${(order.total / 100).toFixed(2)}</span>
-      </li>
-    ))}
-  </ul>
-)
+export const OrderList = () => {
+  const [page, setPage] = useState(1)
+  const [data, setData] = useState<OrdersResponse | null>(null)
+
+  useEffect(() => {
+    fetch(\`/api/orders?page=\${page}\`)
+      .then((response) => response.json())
+      .then((json: OrdersResponse) => setData(json))
+  }, [page])
+
+  if (!data) {
+    return <p className="text-sm text-muted-foreground">Loading orders…</p>
+  }
+
+  return (
+    <div className="space-y-4">
+      <ul className="divide-y">
+        {data.orders.map((order) => (
+          <li key={order.id} className="flex justify-between py-2">
+            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
+            <span>\${(order.total / 100).toFixed(2)}</span>
+          </li>
+        ))}
+      </ul>
+      <div className="flex items-center justify-between">
+        <Button
+          variant="outline"
+          disabled={page === 1}
+          onClick={() => setPage((current) => current - 1)}
+        >
+          Previous
+        </Button>
+        <span className="text-sm">
+          Page {data.page} of {data.totalPages}
+        </span>
+        <Button
+          variant="outline"
+          disabled={page === data.totalPages}
+          onClick={() => setPage((current) => current + 1)}
+        >
+          Next
+        </Button>
+      </div>
+    </div>
+  )
+}
`,
}
