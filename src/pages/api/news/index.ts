import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const response = await axios.get('https://www.forexlive.com/feed/news');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, 'text/xml');
    const items = Array.from(xmlDoc.querySelectorAll('item'));

    const news = items.map(item => ({
      source: 'ForexLive',
      title: item.querySelector('title')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
      link: item.querySelector('link')?.textContent || ''
    }));

    res.status(200).json(news);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}