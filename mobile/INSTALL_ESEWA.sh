#!/bin/bash

# eSewa Payment Integration - Installation Script
# Run this script from the Eventish/mobile directory

echo "=========================================="
echo "eSewa Payment Integration - Installation"
echo "=========================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the Eventish/mobile directory"
    exit 1
fi

echo "📦 Installing react-native-webview..."
npx expo install react-native-webview

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "=========================================="
    echo "Next Steps:"
    echo "=========================================="
    echo ""
    echo "1. Update config/api.ts with your local IP:"
    echo "   const SERVER_URL = 'http://YOUR_LOCAL_IP:5000';"
    echo ""
    echo "2. Make sure backend is running:"
    echo "   cd ../backend && npm start"
    echo ""
    echo "3. Start the mobile app:"
    echo "   npm start"
    echo ""
    echo "4. Test the payment flow:"
    echo "   - Login as customer"
    echo "   - Create a booking"
    echo "   - Wait for vendor to schedule"
    echo "   - Click 'Confirm & Pay Advance'"
    echo "   - Select 'eSewa'"
    echo ""
    echo "📖 For more details, see:"
    echo "   - SETUP_ESEWA.md (Quick setup guide)"
    echo "   - ESEWA_INTEGRATION.md (Full documentation)"
    echo "   - ESEWA_IMPLEMENTATION_SUMMARY.md (Implementation details)"
    echo ""
else
    echo ""
    echo "❌ Installation failed!"
    echo "Please try manually: npx expo install react-native-webview"
    exit 1
fi
