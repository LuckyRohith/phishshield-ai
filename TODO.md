# TODO: Advanced PhishShield AI Enhancements

## 1. Enhance Backend (server.js)
- [x] Add brand impersonation detection for popular brands (Google, Amazon, PayPal, SBI, ICICI)
- [x] Separate risk scoring into categories: URL Risk, Brand Risk, Content Risk
- [x] Update response to include detailed breakdown and reasons
- [x] Fix risk calculation bug where individual risks could exceed 100

## 2. Update Extension UI (popup.html, popup.css, popup.js)
- [x] Add sections for detailed risk breakdown (URL Risk, Brand Risk, Content Risk) in popup.html
- [x] Style new elements in popup.css
- [x] Implement scan history feature using localStorage (store last 10 scans with timestamps) in popup.js
- [x] Update UI for detailed results and history list in popup.js
- [x] Skip analysis for chrome-extension URLs to prevent unnecessary requests
- [x] Add request cancellation to prevent multiple simultaneous requests

## 3. Add Scan History
- [x] Store scans in browser localStorage
- [x] Display history in popup with option to re-analyze

## 4. Error Handling & Stability
- [x] Improve error messages and fallback UI

## 5. Testing & Deployment
- [x] Test locally and on cloud
- [x] Update README with new features
- [x] Fix PowerShell execution policy issue for running npm scripts
- [x] Verify server starts correctly and responds to requests

## 6. Academic Materials (Optional)
- [ ] Generate PDF report, PPT presentation if needed
