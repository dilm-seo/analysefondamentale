import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const stmt = db.prepare('SELECT * FROM settings WHERE user_id = ?');
      let settings = stmt.get(userId);

      if (!settings) {
        const insertStmt = db.prepare(`
          INSERT INTO settings (id, user_id, theme, language, email_notifications, analysis_format)
          VALUES (?, ?, 'dark', 'fr', 1, 'html')
        `);
        const settingsId = crypto.randomUUID();
        insertStmt.run(settingsId, userId);
        
        settings = {
          id: settingsId,
          user_id: userId,
          theme: 'dark',
          language: 'fr',
          email_notifications: true,
          analysis_format: 'html'
        };
      }

      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { theme, language, emailNotifications, analysisFormat, apiKey, systemPrompt } = req.body;

      const stmt = db.prepare(`
        UPDATE settings 
        SET theme = ?, 
            language = ?, 
            email_notifications = ?, 
            analysis_format = ?,
            api_key = ?,
            system_prompt = ?
        WHERE user_id = ?
      `);

      stmt.run(
        theme,
        language,
        emailNotifications ? 1 : 0,
        analysisFormat,
        apiKey,
        systemPrompt,
        userId
      );

      const updatedSettings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId);
      res.status(200).json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}