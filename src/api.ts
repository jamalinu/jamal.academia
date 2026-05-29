import { GoogleGenAI } from "@google/genai";

// Inicializamos Gemini de forma segura con el encabezado de AI Studio
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

export default async function handler(req: any, res: any) {
  // Manejo manual de rutas que antes hacía Express
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, tutorInfo } = req.body;
    
    if (!ai) {
      return res.status(500).json({
        error: "API key missing",
        message: "Para chatear con los tutores de IA se requiere la clave de API de Gemini. Por favor, añádela en la sección correspondiente."
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const tutorDescription = tutorInfo || {
      name: "Sofía",
      style: "De Madrid, paciente y explicativa, utiliza comparaciones gramaticales con el árabe.",
      level: "Todos los niveles"
    };

    const systemInstruction = `
Eres un tutor de español certificado de Al-Andalus Academia llamado ${tutorDescription.name}.
Tu enfoque es: ${tutorDescription.style}.
Estás enseñando español como segunda lengua a un estudiante nativo árabe.
Instrucciones críticas de comportamiento:
1. Habla principalmente en español de nivel adaptativo (simple pero natural), pero usa el árabe de forma clara para explicar conceptos gramaticales difíciles, dar traducciones de auxilio y felicitar al alumno.
2. Compara activamente el español y el árabe para ayudar al estudiante en su transición lingüística:
   - Señala falsos amigos o diferencias críticas (ej. género de sol/luna: sol en árabe es femenino [شمس] pero en español es masculino [el sol]; luna es masculino en árabe [قمر] pero en español es femenino [la luna]).
   - Explica el uso de los verbos Ser y Estar comparándolo con la oración nominal árabe sin cópula (جملة اسمية).
   - Recomienda palabras con raíz compartida árabe-española (como almohada/المخدة [al-mukhada], azúcar/السكر [as-sukkar], etc.).
3. Siempre corrige de manera constructiva cualquier error del alumno. Explícale su fallo gramatical en árabe de forma comprensible y dale una versión corregida en español.
4. Mantén la motivación viva con palabras de aliento (¡Excelente! / ممتاز !, ¡Así se hace! / أحسنت !).
5. Las respuestas deben ser breves, cómodas de leer en móviles y empáticas.
`;

    // Mapeamos los mensajes asegurando que 'text' esté presente
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text || m.content || "" }]
    }));

    // Usamos el modelo correcto y la configuración nativa del SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "Lo siento, tuve dificultades para procesar eso. ¿Podrías repetirlo?";
    return res.status(200).json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "No se pudo conectar con el servidor de la inteligencia artificial."
    });
  }
}
