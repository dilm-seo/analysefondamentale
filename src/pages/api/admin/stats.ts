import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { adminService } from '@/services/adminService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (req.method === 'GET') {
      const stats = await adminService.getStats();
      return res.status(200).json(stats);
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}