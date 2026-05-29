import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, tutorInfo } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: "API key missing",
        message: "Falta la clave de API de Gemini."
      });
    }

    const tutorDescription = tutorInfo || {
      name: "Sofía",
      style: "Paciente y explicativa.",
      level: "Todos los niveles"
    };

    const systemInstruction = `
Eres un tutor de español certificado de Al-Andalus Academia llamado ${tutorDescription.name}.
Tu enfoque es: ${tutorDescription.style}.
Estás enseñando español como segunda lengua a un estudiante nativo árabe.
Habla principalmente en español adaptativo, pero usa el árabe para explicar conceptos difíciles.
Compara activamente el español y el árabe. Corrige errores de forma constructiva.
Respuestas breves y empáticas.
`;

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: { systemInstruction, temperature: 0.7 }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: error.message });
  }
}
