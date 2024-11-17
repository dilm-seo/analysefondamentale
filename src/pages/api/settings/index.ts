import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const userId = session.user?.id;

  if (req.method === 'GET') {
    try {
      const settings = await prisma.settings.findUnique({
        where: { userId }
      });

      if (!settings) {
        // Créer des paramètres par défaut si inexistants
        const defaultSettings = await prisma.settings.create({
          data: {
            userId,
            theme: 'dark',
            language: 'fr',
            emailNotifications: true,
            analysisFormat: 'html'
          }
        });
        return res.status(200).json(defaultSettings);
      }

      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { theme, language, emailNotifications, analysisFormat, apiKey, systemPrompt } = req.body;

      const settings = await prisma.settings.upsert({
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

      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}