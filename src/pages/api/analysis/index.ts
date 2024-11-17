import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { db, prisma } from '@/lib/db';

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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscription: true }
      });

      if (user?.subscription === 'free') {
        const today = new Date().toISOString().split('T')[0];
        const { rows: [{ count }] } = await db.query(`
          SELECT COUNT(*) as count 
          FROM analyses 
          WHERE user_id = $1 
          AND DATE(created_at) = $2
        `, [userId, today]);

        if (parseInt(count) >= 5) {
          return res.status(403).json({ error: 'Limite quotidienne atteinte' });
        }
      }

      const analysis = await prisma.analysis.create({
        data: {
          content,
          model,
          cost,
          userId
        }
      });

      res.status(201).json(analysis);
    } catch (error) {
      console.error('Erreur analyse:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'GET') {
    try {
      const analyses = await prisma.analysis.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(analyses);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}