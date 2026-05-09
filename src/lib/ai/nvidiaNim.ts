// src/lib/ai/nvidiaNim.ts
/**
 * Fetches an AI suggestion from NVIDIA NIM API using Llama 3.1 8B model.
 */
export const fetchAISuggestion = async (prompt: string) => {
  const API_KEY = import.meta.env.VITE_NVIDIA_NIM_API_KEY;
  // Use relative path for Vite proxy in development
  const BASE_URL = '/api/nvidia';

  if (!API_KEY) {
    console.warn('VITE_NVIDIA_NIM_API_KEY is not defined');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `AI API Error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
};
