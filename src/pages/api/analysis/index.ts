import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import db from '@/lib/db';

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
      const userStmt = db.prepare('SELECT subscription FROM users WHERE id = ?');
      const user = userStmt.get(userId);

      if (user?.subscription === 'free') {
        const today = new Date().toISOString().split('T')[0];
        const countStmt = db.prepare(`
          SELECT COUNT(*) as count 
          FROM analyses 
          WHERE user_id = ? 
          AND date(created_at) = ?
        `);
        const { count } = countStmt.get(userId, today);

        if (count >= 5) {
          return res.status(403).json({ error: 'Limite quotidienne atteinte' });
        }
      }

      const insertStmt = db.prepare(`
        INSERT INTO analyses (id, user_id, content, model, cost, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const analysisId = crypto.randomUUID();
      insertStmt.run(
        analysisId,
        userId,
        content,
        model,
        cost,
        new Date().toISOString()
      );

      res.status(201).json({ id: analysisId });
    } catch (error) {
      console.error('Erreur analyse:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'GET') {
    try {
      const stmt = db.prepare(`
        SELECT * FROM analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);
      const analyses = stmt.all(session.user.id);

      res.status(200).json(analyses);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}