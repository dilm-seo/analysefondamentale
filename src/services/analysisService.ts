import axios from 'axios';

export const analysisService = {
  async analyzeNews(news: any[], apiKey: string, model: string, systemPrompt: string) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(news) }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Clé API invalide');
        }
        throw new Error(error.response?.data?.error || error.message);
      }
      throw new Error('Erreur lors de l\'analyse');
    }
  }
};