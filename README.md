## 🛠️ Based on Original Project

This web application is based on [carlosperate/microbit-gamepad](https://github.com/carlosperate/microbit-gamepad),  
an open-source NES-style gamepad interface for the BBC micro:bit.

We have modified and extended the original project to improve compatibility, usability, and educational deployment.

---

## 🔄 Modifications Made

- ✨ **Replaced BLE library with native Web Bluetooth API**  
  Improved compatibility with iOS (Bluefy) and Android by directly using `navigator.bluetooth`.
- 📱 **Enhanced mobile browser support**  
  Tested on Android Chrome and iOS Bluefy.
- 🧼 **Removed `microbit-0.4.0.umd.js` dependency**  
  Eliminated indirect BLE layer for better debugging and control.
- 🔧 **Refactored BLE connection and data transmission logic**  
  Used standard GATT operations: `getPrimaryService()` → `getCharacteristic()` → `writeValue()`.
- 🧪 **Improved BLE connection error handling and logging**  
  Provides better user feedback on connection issues.
- 🎨 **Minor UI and UX cleanup**  
  Cleaned up code and labels for classroom-friendly deployment.
- 🚀 **Ready for GitHub Pages or HTTPS deployment**

---

> Original project by [@carlosperate](https://github.com/carlosperate):  
> https://github.com/carlosperate/microbit-gamepad
