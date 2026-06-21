const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.35,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 900,
};

const DEFAULT_SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

const MEDICAL_DISCLAIMER =
  "This is AI-generated guidance for informational support only. It is not a diagnosis or treatment plan. Please consult a licensed doctor for medical decisions.";

const ROLE_CONTEXT = {
  patient: `
You are MediLink AI for a patient.
Your job:
- Explain health information in simple language.
- Suggest when the patient should book a doctor appointment.
- Identify emergency red flags.
- Never give a final diagnosis.
- Never prescribe medicine dosage.
- Always advise consulting a licensed doctor for diagnosis and treatment.
`,

  doctor: `
You are MediLink AI for a doctor.
Your job:
- Help draft clinical notes, prescription advice wording, follow-up instructions, and patient-friendly explanations.
- Do not replace the doctor's clinical judgment.
- Do not invent lab values, diagnosis, or patient history.
- Keep the output concise, professional, and medically cautious.
`,

  admin: `
You are MediLink AI for an admin.
Your job:
- Summarize support tickets.
- Detect priority and urgency.
- Draft polite support replies.
- Help classify operational issues.
- Do not expose private patient data unnecessarily.
`,

  general: `
You are MediLink AI assistant.
Your job:
- Help users understand MediLink features.
- Keep responses safe, professional, and concise.
- For medical questions, do not give final diagnosis or treatment.
`,
};

const normalizeRole = (role = "general") => {
  const cleanRole = String(role || "general").toLowerCase();

  if (["patient", "doctor", "admin"].includes(cleanRole)) {
    return cleanRole;
  }

  return "general";
};

const extractGeminiText = (data) => {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];

  const text = candidates
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();

  if (text) {
    return text;
  }

  const finishReason = candidates?.[0]?.finishReason;

  if (finishReason) {
    return `AI response was blocked or stopped. Reason: ${finishReason}`;
  }

  return "AI could not generate a response right now.";
};

const buildSystemInstruction = ({ role, context = "" }) => {
  const normalizedRole = normalizeRole(role);
  const roleInstruction = ROLE_CONTEXT[normalizedRole] || ROLE_CONTEXT.general;

  return `
${roleInstruction}

Project context:
MediLink is a healthcare appointment, prescription, payment, support, and medical history management platform.

Safety rules:
- Do not claim certainty for diagnosis.
- Do not create emergency delay.
- If symptoms sound severe, advise emergency care immediately.
- Do not provide dangerous, illegal, or harmful instructions.
- Keep private data minimal.
- Add this disclaimer when the topic is medical:
"${MEDICAL_DISCLAIMER}"

Extra context from app:
${context || "No extra context provided."}
`;
};

export const generateGeminiResponse = async ({
  prompt,
  role = "general",
  context = "",
  temperature,
  maxOutputTokens,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend .env file.");
  }

  if (!prompt || !String(prompt).trim()) {
    throw new Error("AI prompt is required.");
  }

  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch is not available. Please use Node.js 18+ for the backend."
    );
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const endpoint = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    systemInstruction: {
      parts: [
        {
          text: buildSystemInstruction({
            role,
            context,
          }),
        },
      ],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: String(prompt).trim(),
          },
        ],
      },
    ],
    generationConfig: {
      ...DEFAULT_GENERATION_CONFIG,
      temperature:
        typeof temperature === "number"
          ? temperature
          : DEFAULT_GENERATION_CONFIG.temperature,
      maxOutputTokens:
        typeof maxOutputTokens === "number"
          ? maxOutputTokens
          : DEFAULT_GENERATION_CONFIG.maxOutputTokens,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Gemini API request failed with status ${response.status}`;

    throw new Error(message);
  }

  const answer = extractGeminiText(data);

  return {
    answer,
    model,
    role: normalizeRole(role),
    raw: data,
  };
};

export const buildAiContextFromUser = (user) => {
  if (!user) {
    return "No authenticated user context.";
  }

  return `
Authenticated user:
- Name: ${user.name || "Unknown"}
- Email: ${user.email || "Unknown"}
- Role: ${user.role || "Unknown"}
`;
};

export const MEDILINK_AI_DISCLAIMER = MEDICAL_DISCLAIMER;