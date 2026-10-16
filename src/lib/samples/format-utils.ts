import type { Sample } from './types'

export const formatUtilsSample: Sample = {
  id: 'format-utils',
  name: 'Format helpers with tests (clean)',
  seededBugs: [],
  diff: `diff --git a/src/lib/format.test.ts b/src/lib/format.test.ts
new file mode 100644
index 0000000..b994a62
--- /dev/null
+++ b/src/lib/format.test.ts
@@ -0,0 +1,37 @@
+import { describe, expect, it } from 'vitest'
+
+import { formatUsd, pluralize, truncate } from '@/lib/format'
+
+describe('formatUsd', () => {
+  it('formats cents as dollars', () => {
+    expect(formatUsd(123456)).toBe('$1,234.56')
+  })
+
+  it('formats zero', () => {
+    expect(formatUsd(0)).toBe('$0.00')
+  })
+})
+
+describe('pluralize', () => {
+  it('uses the singular form for one', () => {
+    expect(pluralize(1, 'order')).toBe('1 order')
+  })
+
+  it('adds an s by default', () => {
+    expect(pluralize(3, 'order')).toBe('3 orders')
+  })
+
+  it('accepts an irregular plural', () => {
+    expect(pluralize(2, 'child', 'children')).toBe('2 children')
+  })
+})
+
+describe('truncate', () => {
+  it('keeps short text unchanged', () => {
+    expect(truncate('Hello', 10)).toBe('Hello')
+  })
+
+  it('cuts long text and adds an ellipsis', () => {
+    expect(truncate('Hello world', 6)).toBe('Hello…')
+  })
+})
diff --git a/src/lib/format.ts b/src/lib/format.ts
new file mode 100644
index 0000000..53b5983
--- /dev/null
+++ b/src/lib/format.ts
@@ -0,0 +1,21 @@
+const usdFormatter = new Intl.NumberFormat('en-US', {
+  style: 'currency',
+  currency: 'USD',
+})
+
+export const formatUsd = (amountInCents: number) =>
+  usdFormatter.format(amountInCents / 100)
+
+export const pluralize = (
+  count: number,
+  singular: string,
+  plural = \`\${singular}s\`
+) => \`\${count} \${count === 1 ? singular : plural}\`
+
+export const truncate = (text: string, maxLength: number) => {
+  if (text.length <= maxLength) {
+    return text
+  }
+
+  return \`\${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…\`
+}
`,
}
