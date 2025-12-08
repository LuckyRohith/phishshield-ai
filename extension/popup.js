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

function updateUI(result) {
  const statusBox = document.getElementById("status-box");
  const statusText = document.getElementById("status-text");
  const scoreText = document.getElementById("score-text");
  const detailsText = document.getElementById("details-text");

  statusBox.classList.remove("neutral", "safe", "danger");

  if (result.is_phishing) {
    statusBox.classList.add("danger");
    statusText.textContent = "⚠️ Suspicious / Phishing";
  } else {
    statusBox.classList.add("safe");
    statusText.textContent = "✅ Likely Safe";
  }

  scoreText.textContent = `Risk Score: ${result.risk_score} / 100`;
  detailsText.textContent = result.reason || "No additional details.";
}

async function analyze(url) {
  const urlElement = document.getElementById("url");
  const statusBox = document.getElementById("status-box");
  const statusText = document.getElementById("status-text");
  const scoreText = document.getElementById("score-text");
  const detailsText = document.getElementById("details-text");

  urlElement.textContent = url;

  statusBox.classList.remove("safe", "danger");
  statusBox.classList.add("neutral");
  statusText.textContent = "Analyzing...";
  scoreText.textContent = "";
  detailsText.textContent = "Contacting analysis server...";

  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error("Server returned error");
    }

    const result = await response.json();
    updateUI(result);
  } catch (err) {
    console.error(err);
    statusBox.classList.add("danger");
    statusText.textContent = "Error";
    scoreText.textContent = "";
    detailsText.textContent = "Could not analyze URL. Is the server running?";
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