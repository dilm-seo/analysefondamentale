import { useSettingsStore } from '@/stores/settingsStore';

export const analysisService = {
  async analyzeNews(news: any[], apiKey: string, model: string, systemPrompt: string) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(news) }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    }
  }
};