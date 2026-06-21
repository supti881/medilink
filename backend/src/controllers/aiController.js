import {
  buildAiContextFromUser,
  generateGeminiResponse,
  MEDILINK_AI_DISCLAIMER,
} from "../services/geminiService.js";

const cleanText = (value = "") => {
  return String(value || "").trim();
};

const clampNumber = (value, min, max, fallback) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
};

const buildCommonMeta = (req) => {
  return {
    userId: req.user?._id || null,
    role: req.user?.role || "general",
    createdAt: new Date().toISOString(),
  };
};

const sendAiResponse = (res, result, extra = {}) => {
  return res.status(200).json({
    success: true,
    answer: result.answer,
    model: result.model,
    role: result.role,
    disclaimer: MEDILINK_AI_DISCLAIMER,
    ...extra,
  });
};

export const askMediLinkAi = async (req, res) => {
  try {
    const { prompt, context, mode, temperature, maxOutputTokens } = req.body;

    const cleanPrompt = cleanText(prompt);

    if (!cleanPrompt) {
      return res.status(400).json({
        success: false,
        message: "AI prompt is required.",
      });
    }

    const userRole = req.user?.role || "general";

    const appContext = `
${buildAiContextFromUser(req.user)}

AI mode:
${cleanText(mode) || "General MediLink assistant"}

User provided context:
${cleanText(context) || "No extra context provided."}
`;

    const result = await generateGeminiResponse({
      prompt: cleanPrompt,
      role: userRole,
      context: appContext,
      temperature: clampNumber(temperature, 0, 1, 0.35),
      maxOutputTokens: clampNumber(maxOutputTokens, 200, 1200, 900),
    });

    return sendAiResponse(res, result, {
      meta: buildCommonMeta(req),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AI assistant failed to generate a response.",
      error: error.message,
    });
  }
};
export const patientSymptomAssistant = async (req, res) => {
  try {
    const {
      symptoms,
      duration,
      age,
      gender,
      existingConditions,
      currentMedicines,
      extraNotes,
    } = req.body;

    const cleanSymptoms = cleanText(symptoms);

    if (!cleanSymptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required for patient AI assistant.",
      });
    }

    const prompt = `
Patient symptoms:
${cleanSymptoms}

Duration:
${cleanText(duration) || "Not provided"}

Age:
${cleanText(age) || "Not provided"}

Gender:
${cleanText(gender) || "Not provided"}

Existing conditions:
${cleanText(existingConditions) || "Not provided"}

Current medicines:
${cleanText(currentMedicines) || "Not provided"}

Extra notes:
${cleanText(extraNotes) || "Not provided"}

Task:
Give a COMPLETE patient-friendly guidance response. Do not stop after numbering. Do not give a final diagnosis. Do not prescribe medicine dosage.

Use this exact format and complete every section:

1. General explanation:
Explain what these symptoms may commonly indicate in simple words.

2. Red flags / emergency warning signs:
List symptoms that mean the patient should seek urgent medical help.

3. What the patient can do now:
Give safe self-care guidance such as rest, hydration, monitoring temperature, and avoiding risky actions.

4. When to consult a doctor:
Explain when doctor consultation is recommended based on symptoms duration or severity.

5. Important note:
Add a short medical safety disclaimer.

Important safety rules:
- Do not diagnose the disease with certainty.
- Do not prescribe medicine dosage.
- Do not say the patient is safe if low blood pressure, chest pain, breathing difficulty, fainting, severe weakness, or confusion is present.
- If emergency red flags appear, advise emergency care immediately.
- Keep the answer complete, practical, and easy to understand.
`;

    const context = `
${buildAiContextFromUser(req.user)}

This request comes from Patient Dashboard symptom guidance.
The patient needs a full but safe explanation.
`;

    const result = await generateGeminiResponse({
      prompt,
      role: "patient",
      context,
      temperature: 0.25,
      maxOutputTokens: 1800,
    });

    return sendAiResponse(res, result, {
      meta: {
        ...buildCommonMeta(req),
        feature: "patient_symptom_assistant",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Patient AI assistant failed.",
      error: error.message,
    });
  }
};

export const doctorPrescriptionAssistant = async (req, res) => {
  try {
    const {
      patientName,
      age,
      gender,
      symptoms,
      diagnosis,
      clinicalNotes,
      medicines,
      tests,
      advice,
      followUpPlan,
    } = req.body;

    const cleanDiagnosis = cleanText(diagnosis);
    const cleanSymptoms = cleanText(symptoms);

    if (!cleanDiagnosis && !cleanSymptoms && !cleanText(clinicalNotes)) {
      return res.status(400).json({
        success: false,
        message:
          "Diagnosis, symptoms, or clinical notes are required for prescription assistant.",
      });
    }

    const prompt = `
Patient:
${cleanText(patientName) || "Not provided"}

Age:
${cleanText(age) || "Not provided"}

Gender:
${cleanText(gender) || "Not provided"}

Symptoms:
${cleanSymptoms || "Not provided"}

Doctor diagnosis / impression:
${cleanDiagnosis || "Not provided"}

Clinical notes:
${cleanText(clinicalNotes) || "Not provided"}

Medicines already considered by doctor:
${cleanText(medicines) || "Not provided"}

Tests:
${cleanText(tests) || "Not provided"}

Advice:
${cleanText(advice) || "Not provided"}

Follow-up plan:
${cleanText(followUpPlan) || "Not provided"}

Task:
Help the doctor draft professional prescription support text.

Response format:
1. Clean clinical note summary
2. Patient-friendly explanation
3. Advice wording
4. Follow-up instruction
5. Safety reminder

Important:
- Do not invent medicines.
- Do not invent lab results.
- Do not override the doctor's clinical judgment.
- If medicine details are missing, ask the doctor to review/add them manually.
`;

    const context = `
${buildAiContextFromUser(req.user)}

This request comes from Doctor Dashboard prescription helper.
The doctor remains responsible for final medical decision.
`;

    const result = await generateGeminiResponse({
      prompt,
      role: "doctor",
      context,
      temperature: 0.25,
      maxOutputTokens: 900,
    });

    return sendAiResponse(res, result, {
      meta: {
        ...buildCommonMeta(req),
        feature: "doctor_prescription_assistant",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Doctor AI assistant failed.",
      error: error.message,
    });
  }
};

export const adminSupportAssistant = async (req, res) => {
  try {
    const {
      subject,
      message,
      category,
      status,
      patientName,
      doctorName,
      previousReplies,
    } = req.body;

    const cleanMessage = cleanText(message);

    if (!cleanMessage && !cleanText(subject)) {
      return res.status(400).json({
        success: false,
        message: "Support ticket subject or message is required.",
      });
    }

    const prompt = `
Support ticket subject:
${cleanText(subject) || "Not provided"}

Category:
${cleanText(category) || "Not provided"}

Current status:
${cleanText(status) || "Not provided"}

Patient:
${cleanText(patientName) || "Not provided"}

Doctor:
${cleanText(doctorName) || "Not provided"}

Ticket message:
${cleanMessage || "Not provided"}

Previous replies:
${cleanText(previousReplies) || "Not provided"}

Task:
Help admin handle this support ticket.

Response format:
1. Short summary
2. Priority: low / medium / high / urgent
3. Main issue type
4. Suggested admin action
5. Polite reply draft to user

Important:
- Do not expose unnecessary private medical data.
- Keep reply professional, calm, and service-oriented.
`;

    const context = `
${buildAiContextFromUser(req.user)}

This request comes from Admin Dashboard support assistant.
Focus on operational clarity and safe communication.
`;

    const result = await generateGeminiResponse({
      prompt,
      role: "admin",
      context,
      temperature: 0.35,
      maxOutputTokens: 900,
    });

    return sendAiResponse(res, result, {
      meta: {
        ...buildCommonMeta(req),
        feature: "admin_support_assistant",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin AI assistant failed.",
      error: error.message,
    });
  }
};

export const doctorClinicalNoteAssistant = async (req, res) => {
  try {
    const {
      patientName,
      symptoms,
      appointmentReason,
      medicalHistory,
      doctorObservation,
      plan,
    } = req.body;

    if (
      !cleanText(symptoms) &&
      !cleanText(appointmentReason) &&
      !cleanText(doctorObservation)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Symptoms, appointment reason, or doctor observation is required.",
      });
    }

    const prompt = `
Patient:
${cleanText(patientName) || "Not provided"}

Appointment reason:
${cleanText(appointmentReason) || "Not provided"}

Symptoms:
${cleanText(symptoms) || "Not provided"}

Relevant medical history:
${cleanText(medicalHistory) || "Not provided"}

Doctor observation:
${cleanText(doctorObservation) || "Not provided"}

Plan:
${cleanText(plan) || "Not provided"}

Task:
Draft a concise clinical note for doctor review.

Response format:
1. Chief complaint
2. Brief history
3. Assessment note
4. Plan wording
5. Patient instruction wording

Important:
- Do not invent missing facts.
- Mark uncertain parts clearly.
- Doctor must review before saving.
`;

    const context = `
${buildAiContextFromUser(req.user)}

This request comes from Doctor Dashboard clinical note helper.
`;

    const result = await generateGeminiResponse({
      prompt,
      role: "doctor",
      context,
      temperature: 0.25,
      maxOutputTokens: 800,
    });

    return sendAiResponse(res, result, {
      meta: {
        ...buildCommonMeta(req),
        feature: "doctor_clinical_note_assistant",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Clinical note AI assistant failed.",
      error: error.message,
    });
  }
};