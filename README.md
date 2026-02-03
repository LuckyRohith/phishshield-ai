# PhishShield AI

AI-inspired heuristic-based phishing and scam URL detector implemented as a Chrome extension with a Node.js backend.

## 🚀 How to Use

### Chrome Extension Setup

1. Open Google Chrome.
2. Go to `chrome://extensions/`.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked**.
5. Select the `extension` folder inside the project directory.

### Real-Time Analysis

1. Open any website in Chrome.
2. Click the **PhishShield AI** extension icon in the toolbar.
3. The extension will automatically analyze the current tab and display:
   - Overall risk score (0-100)
   - Detailed risk breakdown (URL/Brand/Content)
   - Analysis reasoning
   - Recent scan history

### Local Development (Optional)

If you want to run the backend locally instead of using the cloud API:

1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Update `extension/popup.js` to use `http://localhost:5000/analyze` instead of the cloud URL.

The local server will run on `http://localhost:5000`.

## Project Author

Rohith – Cybersecurity Student"# phishshield-ai" 
"# phishshield-ai" 
