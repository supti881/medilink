const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export const MEDILINK_AI_DISCLAIMER =
  "This AI assistant provides general health guidance only. It is not a medical diagnosis, prescription, or emergency service. Please consult a qualified doctor for medical decisions.";

export const buildAiContextFromUser = (user = {}) => {
  const profile = user.profile || user;

  const contextParts = [
    profile?.name ? `Patient name: ${profile.name}` : "",
    profile?.age ? `Age: ${profile.age}` : "",
    profile?.gender ? `Gender: ${profile.gender}` : "",
    profile?.bloodGroup ? `Blood group: ${profile.bloodGroup}` : "",
    profile?.medicalNotes ? `Medical notes: ${profile.medicalNotes}` : "",
    profile?.emergencyContactName
      ? `Emergency contact: ${profile.emergencyContactName}`
      : "",
  ].filter(Boolean);

  return contextParts.length
    ? contextParts.join("\n")
    : "No additional patient profile context available.";
};

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];

  return parts
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
};

const buildPromptText = ({
  systemInstruction = "",
  context = "",
  aiContext = "",
  prompt = "",
  userPrompt = "",
  text = "",
  symptoms = "",
  duration = "",
  age = "",
  gender = "",
  existingConditions = "",
  currentMedicines = "",
  extraNotes = "",
}) => {
  const safetyInstruction = `
You are MediLink AI Assistant for a healthcare web application.
Give safe, simple, non-diagnostic health guidance.
Do not prescribe medicine.
Do not claim a confirmed diagnosis.
For emergency symptoms, advise immediate emergency medical care.
Recommend booking a qualified doctor when appropriate.
Keep the answer clear and practical.
`;

  const promptParts = [
    safetyInstruction,
    systemInstruction,
    context ? `Patient context:\n${context}` : "",
    aiContext ? `Patient context:\n${aiContext}` : "",
    prompt,
    userPrompt,
    text,
    symptoms ? `Symptoms: ${symptoms}` : "",
    duration ? `Duration: ${duration}` : "",
    age ? `Age: ${age}` : "",
    gender ? `Gender: ${gender}` : "",
    currentMedicines ? `Current medicines: ${currentMedicines}` : "",
    existingConditions ? `Existing conditions: ${existingConditions}` : "",
    extraNotes ? `Extra notes: ${extraNotes}` : "",
  ].filter(Boolean);

  return promptParts.join("\n\n").trim();
};

export const generateGeminiResponse = async (payload = {}) => {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend .env file.");
  }

  const model = String(process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const endpoint = `${GEMINI_API_BASE_URL}/models/${model}:generateContent`;

  const promptText = buildPromptText(payload);

  if (!promptText) {
    throw new Error("Gemini prompt is empty.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: payload.temperature ?? 0.35,
        maxOutputTokens: payload.maxOutputTokens ?? 700,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiMessage =
      data?.error?.message ||
      data?.message ||
      `Gemini API request failed with status ${response.status}`;

    throw new Error(`Gemini API error ${response.status}: ${apiMessage}`);
  }

  const answer = extractGeminiText(data);

  if (!answer) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    answer,
    model,
    disclaimer: MEDILINK_AI_DISCLAIMER,
    raw: data,
  };
};