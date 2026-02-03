function saveScanToHistory(url, result) {
  const history = JSON.parse(localStorage.getItem('phishshield_history') || '[]');
  const scanEntry = {
    url: url,
    risk_score: result.risk_score,
    is_phishing: result.is_phishing,
    timestamp: new Date().toISOString()
  };

  // Add to beginning of array, keep only last 10
  history.unshift(scanEntry);
  if (history.length > 10) {
    history.splice(10);
  }

  localStorage.setItem('phishshield_history', JSON.stringify(history));
}

function loadScanHistory() {
  const history = JSON.parse(localStorage.getItem('phishshield_history') || '[]');
  const historyList = document.getElementById('history-list');
  const noHistory = document.getElementById('no-history');

  if (history.length === 0) {
    noHistory.style.display = 'block';
    historyList.innerHTML = '<p id="no-history">No recent scans</p>';
    return;
  }

  noHistory.style.display = 'none';
  historyList.innerHTML = '';

  history.forEach(scan => {
    const item = document.createElement('div');
    item.className = 'history-item';

    const urlSpan = document.createElement('span');
    urlSpan.className = 'history-url';
    urlSpan.textContent = scan.url.length > 50 ? scan.url.substring(0, 47) + '...' : scan.url;

    const statusSpan = document.createElement('span');
    statusSpan.className = `history-status ${scan.is_phishing ? 'danger' : 'safe'}`;
    statusSpan.textContent = scan.is_phishing ? 'PHISHING' : 'SAFE';

    const timeSpan = document.createElement('div');
    timeSpan.className = 'history-time';
    const date = new Date(scan.timestamp);
    timeSpan.textContent = date.toLocaleString();

    item.appendChild(urlSpan);
    item.appendChild(statusSpan);
    item.appendChild(timeSpan);

    // Add click handler to re-analyze
    item.addEventListener('click', () => {
      analyze(scan.url);
    });

    historyList.appendChild(item);
  });
}

async function getCurrentTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      if (!tabs || !tabs.length) {
        return reject(new Error("No active tab"));
      }
      resolve(tabs[0].url);
    });
  });
}

// Update UI with analysis results or error state
function updateUI(result, url, isOffline = false) {
  const statusBox = document.getElementById("status-box");
  const statusText = document.getElementById("status-text");
  const scoreText = document.getElementById("score-text");
  const detailsText = document.getElementById("details-text");
  const urlRisk = document.getElementById("url-risk");
  const brandRisk = document.getElementById("brand-risk");
  const contentRisk = document.getElementById("content-risk");

  statusBox.classList.remove("neutral", "safe", "danger");

  if (isOffline || !result) {
    // Handle offline/server unreachable state or invalid result
    statusBox.classList.add("danger");
    statusText.textContent = "🔌 Server Unreachable";
    scoreText.textContent = "Risk Score: 0 / 100";
    detailsText.textContent = "Cannot connect to analysis server. Check your internet connection.";
    if (urlRisk) urlRisk.textContent = "0";
    if (brandRisk) brandRisk.textContent = "0";
    if (contentRisk) contentRisk.textContent = "0";
    return; // Don't save offline results to history
  }

  // Handle successful analysis
  if (result.is_phishing) {
    statusBox.classList.add("danger");
    statusText.textContent = "⚠️ Suspicious / Phishing";
  } else {
    statusBox.classList.add("safe");
    statusText.textContent = "✅ Likely Safe";
  }

  scoreText.textContent = `Risk Score: ${result.risk_score || 0} / 100`;
  detailsText.textContent = result.reason || "No additional details.";

  // Update risk breakdown
  if (result.breakdown) {
    if (urlRisk) urlRisk.textContent = result.breakdown.url_risk || "0";
    if (brandRisk) brandRisk.textContent = result.breakdown.brand_risk || "0";
    if (contentRisk) contentRisk.textContent = result.breakdown.content_risk || "0";
  } else {
    // If no breakdown, set defaults
    if (urlRisk) urlRisk.textContent = "0";
    if (brandRisk) brandRisk.textContent = "0";
    if (contentRisk) contentRisk.textContent = "0";
  }

  // Save to scan history only on successful analysis
  saveScanToHistory(url, result);
  loadScanHistory();
}

// Analyze URL with public backend and comprehensive error handling
async function analyze(url) {
  const urlElement = document.getElementById("url");
  const statusBox = document.getElementById("status-box");
  const statusText = document.getElementById("status-text");
  const scoreText = document.getElementById("score-text");
  const detailsText = document.getElementById("details-text");

  // Skip analysis for chrome-extension URLs
  if (url.startsWith('chrome-extension://')) {
    statusBox.classList.remove("neutral", "safe", "danger");
    statusBox.classList.add("safe");
    statusText.textContent = "✅ Extension Page";
    scoreText.textContent = "Risk Score: 0 / 100";
    detailsText.textContent = "This is a Chrome extension page and cannot be analyzed.";
    return;
  }

  urlElement.textContent = url;

  // Reset UI to analyzing state
  statusBox.classList.remove("safe", "danger");
  statusBox.classList.add("neutral");
  statusText.textContent = "Analyzing...";
  scoreText.textContent = "";
  detailsText.textContent = "Contacting analysis server...";

  try {
    // Use public backend endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    // Validate response structure
    if (!result || typeof result.risk_score !== 'number') {
      throw new Error("Invalid response format");
    }

    updateUI(result, url);
  } catch (err) {
    console.error("Analysis error:", err);

    // Determine error type and show appropriate message
    let errorMessage = "Analysis error: Please try again.";
    let isOffline = false;

    if (err.name === 'AbortError') {
      errorMessage = "Request timeout: Server took too long to respond.";
      isOffline = true;
    } else if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
      errorMessage = "Cannot connect to analysis server. Check your internet connection.";
      isOffline = true;
    } else if (err.message.includes('Server error')) {
      errorMessage = "Server error: Analysis service is temporarily unavailable.";
      isOffline = true;
    } else if (err.message.includes('Invalid response')) {
      errorMessage = "Invalid server response. Please try again.";
      isOffline = true;
    }

    // Update UI with error state
    updateUI(null, url, isOffline);

    // Override details text for specific error
    if (isOffline) {
      detailsText.textContent = errorMessage;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const scanBtn = document.getElementById("scan-btn");

  scanBtn.addEventListener("click", async () => {
    try {
      const url = await getCurrentTabUrl();
      analyze(url);
    } catch (err) {
      console.error(err);
    }
  });

  try {
    const url = await getCurrentTabUrl();
    analyze(url);
  } catch (err) {
    console.error(err);
  }
});