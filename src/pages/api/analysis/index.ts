import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/db';

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
      const { rows: [user] } = await db.query(
        'SELECT subscription FROM users WHERE id = $1',
        [userId]
      );

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

      const { rows: [analysis] } = await db.query(`
        INSERT INTO analyses (id, user_id, content, model, cost)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        RETURNING *
      `, [userId, content, model, cost]);

      res.status(201).json(analysis);
    } catch (error) {
      console.error('Erreur analyse:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'GET') {
    try {
      const { rows: analyses } = await db.query(
        'SELECT * FROM analyses WHERE user_id = $1 ORDER BY created_at DESC',
        [session.user.id]
      );

      res.status(200).json(analyses);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}