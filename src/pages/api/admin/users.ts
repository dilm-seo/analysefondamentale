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
      const users = await adminService.getAllUsers();
      return res.status(200).json(users);
    }

    if (req.method === 'DELETE') {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'ID utilisateur requis' });
      }
      await adminService.deleteUser(userId);
      return res.status(200).json({ message: 'Utilisateur supprimé' });
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}