// Estructura de mensajes para TypeScript
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TutorInfo {
  name: string;
  style: string;
  level?: string;
}

export const sendMessageToGemini = async (messages: ChatMessage[], tutorInfo?: TutorInfo): Promise<string> => {
  try {
    // IMPORTANTE: La ruta debe ser exactamente '/api/chat' sin añadir 'http://localhost:5000'
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pasamos los parámetros exactamente con los mismos nombres que espera tu backend (chat.ts)
      body: JSON.stringify({ 
        messages: messages, 
        tutorInfo: tutorInfo 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en el servidor');
    }

    // Tu backend devuelve { text: replyText }, así que extraemos 'text'
    return data.text;
  } catch (error: any) {
    console.error('Error en la comunicación con el tutor de IA:', error);
    throw error;
  }
};
