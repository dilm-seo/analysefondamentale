import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // Simplified response for demo
  if (req.method === 'GET') {
    return res.status(200).json([]);
  }

  if (req.method === 'POST') {
    const { content, model, cost } = req.body;
    return res.status(201).json({ content, model, cost });
  }

  res.status(405).json({ error: 'Méthode non autorisée' });
}