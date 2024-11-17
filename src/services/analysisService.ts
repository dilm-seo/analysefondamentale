import axios from 'axios';

// Prix par 1000 tokens (en USD)
const MODEL_PRICES = {
  'gpt-3.5-turbo': {
    input: 0.0015,
    output: 0.002
  },
  'gpt-4': {
    input: 0.03,
    output: 0.06
  },
  'gpt-4-turbo-preview': {
    input: 0.01,
    output: 0.03
  }
};

// Estimation du nombre de tokens (~4 caractères par token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calcul du coût estimé
function estimateCost(inputText: string, outputText: string, model: string): number {
  const prices = MODEL_PRICES[model as keyof typeof MODEL_PRICES];
  if (!prices) return 0;

  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(outputText);

  const inputCost = (inputTokens / 1000) * prices.input;
  const outputCost = (outputTokens / 1000) * prices.output;

  return Number((inputCost + outputCost).toFixed(4));
}

export const analysisService = {
  async analyzeNews(news: any[], apiKey: string, model: string, systemPrompt: string) {
    try {
      const formattedNews = news.map(item => ({
        source: item.source,
        title: item.title,
        description: item.description,
        date: new Date(item.pubDate).toLocaleString('fr-FR')
      }));

      const inputText = JSON.stringify(formattedNews);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Voici les dernières actualités Forex à analyser:\n\n${inputText}`
            }
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

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Réponse invalide de l\'API');
      }

      const outputText = response.data.choices[0].message.content;
      const cost = estimateCost(inputText, outputText, model);

      return {
        content: outputText,
        cost
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Clé API invalide');
        }
        throw new Error(error.response?.data?.error?.message || 'Erreur lors de l\'analyse');
      }
      throw error;
    }
  }
};