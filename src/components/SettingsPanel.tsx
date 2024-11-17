import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNewsStore } from '@/stores/newsStore';
import toast from 'react-hot-toast';

export default function SettingsPanel() {
  const { 
    apiKey, 
    model, 
    systemPrompt,
    feeds,
    updateSettings,
    addFeed,
    removeFeed,
    toggleFeed 
  } = useSettingsStore();

  const { fetchNews } = useNewsStore();

  const [newFeed, setNewFeed] = useState({
    name: '',
    url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeed.name || !newFeed.url) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      new URL(newFeed.url);
      if (!newFeed.url.toLowerCase().endsWith('.rss') && !newFeed.url.includes('/feed')) {
        toast.error('L\'URL doit pointer vers un flux RSS valide');
        return;
      }
      addFeed(newFeed.name, newFeed.url);
      setNewFeed({ name: '', url: '' });
      toast.success('Flux ajouté avec succès');
      // Rafraîchit les actualités après l'ajout d'un feed
      await fetchNews();
    } catch {
      toast.error('URL invalide');
    }
  };

  const handleToggleFeed = async (url: string) => {
    toggleFeed(url);
    // Rafraîchit les actualités après avoir activé/désactivé un feed
    await fetchNews();
  };

  const handleRemoveFeed = async (url: string) => {
    removeFeed(url);
    toast.success('Source supprimée');
    // Rafraîchit les actualités après la suppression d'un feed
    await fetchNews();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Paramètres API</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">OpenAI GPT</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clé API OpenAI
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="sk-..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modèle GPT
              </label>
              <select
                value={model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt Système
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                rows={15}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                placeholder="Entrez le prompt système..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Sources d'actualités</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={newFeed.name}
              onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Nom de la source"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL du flux RSS</label>
            <input
              type="url"
              value={newFeed.url}
              onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="https://example.com/feed.rss"
            />
            <p className="mt-1 text-sm text-gray-400">
              Exemple: https://www.investing.com/rss/news.rss
            </p>
          </div>
          
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Ajouter la source
          </button>
        </form>

        <div className="space-y-4">
          {feeds?.map((feed) => (
            <div key={feed.url} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={feed.enabled}
                  onChange={() => handleToggleFeed(feed.url)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <h4 className="font-medium text-white">{feed.name}</h4>
                  <p className="text-sm text-gray-400">{feed.url}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFeed(feed.url)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}