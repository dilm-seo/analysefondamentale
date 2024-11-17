import { NextApiRequest, NextApiResponse } from 'next';
import { analysisService } from '@/services/analysisService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { news, apiKey, model, systemPrompt } = req.body;
    const result = await analysisService.analyzeNews(news, apiKey, model, systemPrompt);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur serveur' });
  }
}