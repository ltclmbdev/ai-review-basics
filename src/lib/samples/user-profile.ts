import type { Sample } from './types'

export const userProfileSample: Sample = {
  id: 'user-profile',
  name: 'User profile (React component)',
  seededBugs: [
    'useEffect fetches by userId but has an empty dependency array, so the profile never reloads when userId changes',
    'dangerouslySetInnerHTML renders the user-controlled bio as HTML (XSS)',
  ],
  diff: `diff --git a/src/components/user-profile.tsx b/src/components/user-profile.tsx
index 11bbac4..3cdebbe 100644
--- a/src/components/user-profile.tsx
+++ b/src/components/user-profile.tsx
@@ -1,11 +1,49 @@
-type UserProfileProps = {
+'use client'
+
+import { useEffect, useState } from 'react'
+
+type User = {
+  id: string
   name: string
   avatarUrl: string
+  bio: string
+}
+
+type UserProfileProps = {
+  userId: string
 }
 
-export const UserProfile = ({ name, avatarUrl }: UserProfileProps) => (
-  <section className="flex items-center gap-4">
-    <img src={avatarUrl} alt="" className="size-12 rounded-full" />
-    <h2 className="text-lg font-semibold">{name}</h2>
-  </section>
-)
+export const UserProfile = ({ userId }: UserProfileProps) => {
+  const [user, setUser] = useState<User | null>(null)
+  const [isLoading, setIsLoading] = useState(true)
+
+  useEffect(() => {
+    setIsLoading(true)
+    fetch(\`/api/users/\${userId}\`)
+      .then((response) => response.json())
+      .then((data: User) => setUser(data))
+      .catch(() => setUser(null))
+      .finally(() => setIsLoading(false))
+  }, [])
+
+  if (isLoading) {
+    return <p className="text-sm text-muted-foreground">Loading profile…</p>
+  }
+
+  if (!user) {
+    return <p className="text-sm text-destructive">User not found.</p>
+  }
+
+  return (
+    <section className="space-y-3">
+      <div className="flex items-center gap-4">
+        <img src={user.avatarUrl} alt="" className="size-12 rounded-full" />
+        <h2 className="text-lg font-semibold">{user.name}</h2>
+      </div>
+      <div
+        className="prose prose-sm"
+        dangerouslySetInnerHTML={{ __html: user.bio }}
+      />
+    </section>
+  )
+}
`,
}
