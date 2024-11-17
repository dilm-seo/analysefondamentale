import axios from 'axios';

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

export const translationService = {
  async translateText(text: string): Promise<string> {
    try {
      const response = await axios.get(MYMEMORY_API_URL, {
        params: {
          q: text,
          langpair: 'en|fr',
          de: 'admin@dilm-trading.fr'
        }
      });

      if (response.data?.responseStatus === 429) {
        throw new Error('Limite de traduction atteinte');
      }

      return response.data?.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
};