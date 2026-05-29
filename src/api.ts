export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TutorInfo {
  name: string;
  style: string;
  level?: string;
}

/**
 * Envía el historial de chat al backend serverless de Vercel
 */
export const sendMessageToGemini = async (messages: ChatMessage[], tutorInfo?: TutorInfo): Promise<string> => {
  try {
    // Apuntamos a la ruta relativa de Vercel, solucionando problemas de CORS locales/producción
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages, 
        tutorInfo 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error desconocido en el servidor backend');
    }

    return data.text;
  } catch (error: any) {
    console.error('Error al conectar con el tutor de IA:', error);
    throw error;
  }
};
