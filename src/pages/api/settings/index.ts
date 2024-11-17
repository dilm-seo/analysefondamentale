import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const { rows: [settings] } = await db.query(
        'SELECT * FROM settings WHERE user_id = $1',
        [userId]
      );

      if (!settings) {
        const { rows: [newSettings] } = await db.query(`
          INSERT INTO settings (user_id, theme, language, email_notifications, analysis_format)
          VALUES ($1, 'dark', 'fr', true, 'html')
          RETURNING *
        `, [userId]);
        return res.status(200).json(newSettings);
      }

      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { theme, language, emailNotifications, analysisFormat, apiKey, systemPrompt } = req.body;

      const { rows: [updatedSettings] } = await db.query(`
        INSERT INTO settings (
          user_id, theme, language, email_notifications, analysis_format, api_key, system_prompt
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) DO UPDATE SET
          theme = EXCLUDED.theme,
          language = EXCLUDED.language,
          email_notifications = EXCLUDED.email_notifications,
          analysis_format = EXCLUDED.analysis_format,
          api_key = EXCLUDED.api_key,
          system_prompt = EXCLUDED.system_prompt
        RETURNING *
      `, [userId, theme, language, emailNotifications, analysisFormat, apiKey, systemPrompt]);

      res.status(200).json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}