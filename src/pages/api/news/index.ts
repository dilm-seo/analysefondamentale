import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/db';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { rows: feeds } = await db.query('SELECT * FROM feeds WHERE enabled = true');

    const newsPromises = feeds.map(async (feed) => {
      try {
        const response = await axios.get(feed.url, {
          timeout: 10000,
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml'
          }
        });

        const result = await parseStringPromise(response.data);
        const items = result.rss?.channel?.[0]?.item || [];

        return items.map((item: any) => ({
          source: feed.name,
          title: item.title?.[0] || '',
          description: item.description?.[0] || '',
          pubDate: item.pubDate?.[0] || '',
          link: item.link?.[0] || ''
        }));
      } catch (error) {
        console.error(`Erreur pour ${feed.name}:`, error);
        return [];
      }
    });

    const allNews = (await Promise.all(newsPromises))
      .flat()
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 100);

    res.status(200).json(allNews);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}