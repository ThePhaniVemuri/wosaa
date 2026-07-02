import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SAFE_TERMS = ["safe", "legal", "ethical", "helpful", "standard"];

const isSafeContent = (text = "") => {
  const lower = text.toLowerCase();
  const blockedPatterns = [
    /kill/i,
    /murder/i,
    /weapon/i,
    /exploit/i,
    /malware/i,
    /hack/i,
    /fraud/i,
    /scam/i,
    /drugs/i,
    /illegal/i,
    /hate/i,
    /harass/i,
    /self-harm/i,
  ];

  return !blockedPatterns.some((pattern) => pattern.test(lower));
};

const getFallbackReview = (gigData) => {
  const title = gigData?.title || "";
  const description = gigData?.description || "";
  const category = gigData?.category || "";
  const budget = Number(gigData?.budget || 0);
  const deliveryTimeInDays = Number(gigData?.deliveryTimeInDays || 0);
  const skills = Array.isArray(gigData?.skillsRequired) ? gigData.skillsRequired : [];

  const combinedText = `${title} ${description} ${category} ${skills.join(" ")}`.toLowerCase();
  const suggestions = [];
  const review = {
    safetyCheck: isSafeContent(combinedText),
    saasRelated: /saas|software|app|platform|dashboard|api|automation|mvp|prototype|web|ui|ux|marketing|landing page/i.test(combinedText),
    budgetOk: budget > 0 && budget <= 1000,
    scopeOk: description.trim().length >= 80,
    timelineOk: deliveryTimeInDays > 0 && deliveryTimeInDays <= 30,
  };

  let accepted = review.safetyCheck && review.budgetOk && review.scopeOk && review.timelineOk;

  if (!review.safetyCheck) {
    suggestions.push("Please remove unsafe or disallowed request content.");
  }
  if (!review.budgetOk) {
    suggestions.push("Reduce the budget to $1000 or less.");
  }
  if (!review.scopeOk) {
    suggestions.push("Add more detail about the deliverables and scope so the work is specific.");
  }
  if (!review.timelineOk) {
    suggestions.push("Keep the delivery window within 30 days.");
  }
  if (!review.saasRelated) {
    suggestions.push("Make the gig more clearly tied to a SaaS, software, app, or product build.");
  }
  if (skills.length < 2) {
    suggestions.push("Add at least two relevant skills to make the gig easier to evaluate.");
  }

  return {
    accepted,
    message: accepted
      ? "This gig looks suitable for posting."
      : "This gig needs a few changes before it can be posted.",
    reason: accepted
      ? "The submission is safe, reasonably scoped, and within the expected budget and timeline."
      : "The submission needs adjustments to meet safety, budget, scope, or delivery expectations.",
    suggestedChanges: suggestions,
    review,
    source: "fallback",
  };
};

const reviewGigWithGemini = async (gigData) => {
  if (!GEMINI_API_KEY) {
    return getFallbackReview(gigData);
  }

  const prompt = `You are reviewing a freelance gig submission for a SaaS-focused marketplace. Return valid JSON only.
Evaluate whether it is safe, relevant to a SaaS/software product, fits a budget under $1000, is specific enough, and can reasonably be delivered within a short timeframe. Also suggest concrete changes if needed.

Return this exact JSON structure:
{
  "accepted": true,
  "message": "short summary",
  "reason": "brief reason",
  "suggestedChanges": ["change 1", "change 2"],
  "review": {
    "safetyCheck": true,
    "saasRelated": true,
    "budgetOk": true,
    "scopeOk": true,
    "timelineOk": true
  },
  "confidence": 0.95
}

Gig data:
${JSON.stringify(gigData, null, 2)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      source: "gemini",
      review: {
        safetyCheck: parsed?.review?.safetyCheck ?? true,
        saasRelated: parsed?.review?.saasRelated ?? true,
        budgetOk: parsed?.review?.budgetOk ?? true,
        scopeOk: parsed?.review?.scopeOk ?? true,
        timelineOk: parsed?.review?.timelineOk ?? true,
      },
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return getFallbackReview(gigData);
  }
};

export const reviewGigSubmission = async (gigData) => {
  try {
    return await reviewGigWithGemini(gigData);
  } catch (error) {
    console.error("AI review failed:", error);
    return getFallbackReview(gigData);
  }
};
