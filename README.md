🛠️ Based on Original Project
This web application is based on carlosperate/microbit-gamepad, an open-source NES-style gamepad interface for the BBC micro:bit.

We have modified and extended the original project to improve compatibility, usability, and educational deployment.

🔄 Modifications Made
✨ Replaced BLE library with native Web Bluetooth API for better compatibility with iOS (Bluefy) and Android

📱 Improved mobile browser support (tested on Chrome, Bluefy)

🛠 Removed microbit-0.4.0.umd.js dependency

🧼 Refactored main.js to directly use navigator.bluetooth and writeValue()

🧪 Enhanced BLE connection error handling and logging

🎨 Minor UI and settings cleanup for classroom usability

📦 Ready for deployment via GitHub Pages / HTTPS environment

Original repository by @carlosperate:
https://github.com/carlosperate/microbit-gamepad
