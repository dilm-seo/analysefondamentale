import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbService } from '@/services/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.method === 'POST') {
    try {
      const { content, model, cost } = req.body;
      const userId = session.user.id;

      // Vérifier les limites d'analyse pour les utilisateurs gratuits
      const count = await dbService.getDailyAnalysisCount(userId);
      if (count >= 5) {
        return res.status(403).json({ error: 'Limite quotidienne atteinte' });
      }

      const analysis = await dbService.saveAnalysis(userId, content, model, cost);
      res.status(201).json(analysis);
    } catch (error) {
      console.error('Erreur analyse:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'GET') {
    try {
      const analyses = await dbService.getAnalyses(session.user.id);
      res.status(200).json(analyses);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}