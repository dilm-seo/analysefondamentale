import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  if (req.method === 'POST') {
    try {
      const { content, model, cost } = req.body;
      const userId = session.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'Utilisateur non trouvé' });
      }

      // Vérifier les limites d'analyse pour les utilisateurs gratuits
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.subscription === 'free') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const analysisCount = await prisma.analysis.count({
          where: {
            userId,
            createdAt: {
              gte: today
            }
          }
        });

        if (analysisCount >= 5) {
          return res.status(403).json({ error: 'Limite quotidienne atteinte' });
        }
      }

      const analysis = await prisma.analysis.create({
        data: {
          userId,
          content,
          model,
          cost
        }
      });

      res.status(201).json(analysis);
    } catch (error) {
      console.error('Erreur analyse:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else if (req.method === 'GET') {
    try {
      const userId = session.user?.id;
      const analyses = await prisma.analysis.findMany({
        where: { userId },
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