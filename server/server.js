import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

function basicPhishingHeuristic(url) {
  const lowerUrl = url.toLowerCase();

  let risk = 0;
  const reasons = [];

  const suspiciousKeywords = [
    "login",
    "verify",
    "update",
    "secure",
    "account",
    "bank",
    "paypal",
    "gift",
    "bonus",
    "free",
    "win",
    "otp"
  ];

  suspiciousKeywords.forEach((word) => {
    if (lowerUrl.includes(word)) {
      risk += 10;
      reasons.push(`Contains suspicious keyword: "${word}"`);
    }
  });

  if (url.length > 100) {
    risk += 15;
    reasons.push("URL is unusually long");
  }

  const specialChars = (url.match(/[@%$]/g) || []).length;
  if (specialChars >= 3) {
    risk += 15;
    reasons.push("URL contains many special characters (@, %, $)");
  }

  if (lowerUrl.match(/https?:\/\/\d{1,3}(\.\d{1,3}){3}/)) {
    risk += 20;
    reasons.push("URL uses raw IP address instead of domain name");
  }

  const domainMatch = lowerUrl.match(/https?:\/\/([^/]+)/);
  if (domainMatch) {
    const host = domainMatch[1];
    const dotCount = (host.match(/\./g) || []).length;
    if (dotCount >= 3) {
      risk += 15;
      reasons.push("Domain has too many subdomains (possible obfuscation)");
    }
  }

  if (risk > 100) risk = 100;

  const isPhishing = risk >= 40;

  const reasonText =
    reasons.length > 0
      ? reasons.join("; ")
      : "No major red flags detected using heuristic rules.";

  return {
    risk_score: risk,
    is_phishing: isPhishing,
    reason: reasonText
  };
}

app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log("Analyzing URL:", url);

    const result = basicPhishingHeuristic(url);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`PhishShield AI server running on http://localhost:${PORT}`);
});