import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { db, prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const settings = await prisma.settings.findUnique({
        where: { userId }
      });

      if (!settings) {
        const newSettings = await prisma.settings.create({
          data: {
            userId,
            theme: 'dark',
            language: 'fr',
            emailNotifications: true,
            analysisFormat: 'html'
          }
        });
        return res.status(200).json(newSettings);
      }

      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { theme, language, emailNotifications, analysisFormat, apiKey, systemPrompt } = req.body;

      const updatedSettings = await prisma.settings.upsert({
        where: { userId },
        update: {
          theme,
          language,
          emailNotifications,
          analysisFormat,
          apiKey,
          systemPrompt
        },
        create: {
          userId,
          theme,
          language,
          emailNotifications,
          analysisFormat,
          apiKey,
          systemPrompt
        }
      });

      res.status(200).json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}