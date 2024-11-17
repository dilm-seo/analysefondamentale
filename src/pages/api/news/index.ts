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

  if (req.method === 'GET') {
    try {
      const feeds = await prisma.feed.findMany({
        where: { enabled: true }
      });

      const newsPromises = feeds.map(async (feed) => {
        try {
          const response = await axios.get(feed.url, {
            timeout: 10000,
            headers: {
              'Accept': 'application/rss+xml, application/xml, text/xml'
            }
          });

          // Parser le XML et extraire les news
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response.data, 'text/xml');
          const items = Array.from(xmlDoc.querySelectorAll('item'));

          return items.map(item => ({
            source: feed.name,
            title: item.querySelector('title')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || '',
            link: item.querySelector('link')?.textContent || ''
          }));
        } catch (error) {
          console.error(`Erreur pour ${feed.name}:`, error);
          return [];
        }
      });

      const allNews = (await Promise.all(newsPromises)).flat();
      res.status(200).json(allNews);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}