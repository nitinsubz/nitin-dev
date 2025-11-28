# Firestore Security Rules Setup

## Issue
If you're seeing "0 items" in the console even though data exists in Firestore, it's likely because your Firestore security rules are blocking reads from the client SDK.

## Solution

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the default rules with the rules from `firestore.rules` file in this project
5. Click **Publish**

## Quick Fix (Development Only)

For development, you can use these permissive rules (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }
  }
}
```

## Production Rules

For production, you should:
- Restrict reads to specific collections
- Add authentication if needed
- Use more granular permissions

## Verify Rules Are Applied

After updating rules:
1. Wait a few seconds for rules to propagate
2. Refresh your app
3. Check the browser console - you should see items being fetched

## Alternative: Check Collection Names

Make sure your Firestore collections are named exactly:
- `timeline` (lowercase)
- `career` (lowercase)  
- `shitposts` (lowercase - note: collection name remains `shitposts` for backward compatibility, but the UI shows "Unfiltered")

Case-sensitive!


