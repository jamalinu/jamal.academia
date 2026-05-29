import { GoogleGenAI } from "@google/genai";

// Inicializamos la API de forma segura
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
        message: "Falta la clave de API de Gemini en las variables de entorno."
      });
    }

    // Configuración del tutor
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

    // Mapeo correcto de los mensajes para el SDK de Gemini
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text || m.content || "" }] // Nos aseguramos de capturar el texto
    }));

    // CORRECCIÓN AQUÍ: Estructura exacta para el SDK @google/genai
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // Devolvemos la respuesta en formato JSON limpia
    return res.status(200).json({ text: response.text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Error interno en el manejador de Gemini", 
      details: error.message 
    });
  }
}
