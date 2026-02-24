# Testing Tab Visibility

## Current Configuration

The Messages tab is now set to **ALWAYS SHOW** for testing purposes.

## What You Should See Now

After restarting the app, you should see these tabs in the bottom navigation:

### For ALL Users (Customer/Vendor/Admin):
1. 🏠 Home
2. 💬 **Messages** ← Should be visible now!
3. 🐛 Debug
4. 👤 Account

### For Customers:
1. 🏠 Home
2. 🔍 Explore
3. 📅 Bookings
4. 💬 **Messages** ← Should be visible!
5. 🐛 Debug
6. 👤 Account

### For Vendors:
1. 🏠 Home
2. 📅 Bookings
3. 💬 **Messages** ← Should be visible!
4. 🐛 Debug
5. 👤 Account

## Steps to Test

1. **Stop the development server** (Ctrl+C in terminal)

2. **Clear cache and restart:**
   ```bash
   cd mobile
   npm start -- --reset-cache
   ```

3. **Wait for Metro to finish bundling**

4. **Reload the app:**
   - iOS: Press `Cmd+R` or shake device → Reload
   - Android: Press `R` twice or shake device → Reload

5. **Check the bottom tab bar**
   - Count the tabs
   - Look for the Messages icon (💬)
   - Look for the Debug icon (🐛)

## If Still Not Showing

### Option 1: Hard Reset
```bash
# Stop the server
# Then:
cd mobile
rm -rf node_modules .expo
npm install
npm start
```

### Option 2: Check Expo Router Version
```bash
cd mobile
npm list expo-router
```

Should be version 3.x or higher.

### Option 3: Verify File Structure
Run this command:
```bash
ls -la mobile/app/\(tabs\)/
```

You should see:
- messages.tsx ✓
- debug-role.tsx ✓
- _layout.tsx ✓

### Option 4: Check for Errors
Look in the terminal for any red error messages, especially:
- "Unable to resolve module"
- "Syntax error"
- "Component exception"

## Console Logs to Look For

When the app loads, you should see:
```
🔍 Tab Layout - Detected Role: [your-role]
💬 Messages tab rendering, role: [your-role]
```

## What's Different Now

**Before:**
```typescript
href: (role === 'user' || role === 'customer' || role === 'vendor') ? '/messages' : null,
```

**Now (Temporary):**
```typescript
// href line is commented out - tab always shows
```

This means the Messages tab should show for EVERYONE, including admins and even if not logged in.

## Next Steps

Once you confirm the Messages tab is showing:

1. We'll know the tab system works
2. We can re-enable the role-based visibility
3. We can remove the Debug tab

## Still Having Issues?

Take a screenshot of:
1. Your bottom tab bar
2. The terminal output
3. Any error messages

And share what you see!
