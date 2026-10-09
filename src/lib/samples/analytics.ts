import type { Sample } from './types'

export const analyticsSample: Sample = {
  id: 'analytics',
  name: 'Analytics tracking (client)',
  seededBugs: [
    'A secret API key is hard-coded in a client module, so it ships to every browser',
  ],
  diff: `diff --git a/src/app/layout.tsx b/src/app/layout.tsx
index 1b1d242..2a938a3 100644
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -1,5 +1,7 @@
 import type { Metadata } from 'next'
 
+import { AnalyticsProvider } from '@/components/analytics-provider'
+
 import './globals.css'
 
 export const metadata: Metadata = {
@@ -8,7 +10,9 @@ export const metadata: Metadata = {
 
 const RootLayout = ({ children }: { children: React.ReactNode }) => (
   <html lang="en">
-    <body>{children}</body>
+    <body>
+      <AnalyticsProvider>{children}</AnalyticsProvider>
+    </body>
   </html>
 )
 
diff --git a/src/components/analytics-provider.tsx b/src/components/analytics-provider.tsx
new file mode 100644
index 0000000..81be80f
--- /dev/null
+++ b/src/components/analytics-provider.tsx
@@ -0,0 +1,22 @@
+'use client'
+
+import { useEffect } from 'react'
+import { usePathname } from 'next/navigation'
+
+import { track } from '@/lib/analytics'
+
+export const AnalyticsProvider = ({
+  children,
+}: {
+  children: React.ReactNode
+}) => {
+  const pathname = usePathname()
+
+  useEffect(() => {
+    track({ name: 'page_view', properties: { path: pathname } }).catch(
+      () => {}
+    )
+  }, [pathname])
+
+  return children
+}
diff --git a/src/lib/analytics.ts b/src/lib/analytics.ts
new file mode 100644
index 0000000..e60a4ec
--- /dev/null
+++ b/src/lib/analytics.ts
@@ -0,0 +1,25 @@
+'use client'
+
+const ANALYTICS_ENDPOINT = 'https://api.example-analytics.com/v1/events'
+const ANALYTICS_SECRET_KEY = 'ea_secret_3f9c2d7b8a1e4f6c9d0b5a7e2c8f1d4b'
+
+type AnalyticsEvent = {
+  name: string
+  properties?: Record<string, string | number | boolean>
+}
+
+export const track = async ({ name, properties = {} }: AnalyticsEvent) => {
+  await fetch(ANALYTICS_ENDPOINT, {
+    method: 'POST',
+    headers: {
+      'Content-Type': 'application/json',
+      Authorization: \`Bearer \${ANALYTICS_SECRET_KEY}\`,
+    },
+    body: JSON.stringify({
+      name,
+      properties,
+      timestamp: new Date().toISOString(),
+    }),
+    keepalive: true,
+  })
+}
`,
}
