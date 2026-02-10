import { useState, useEffect } from 'react';
import { saveApiKey, clearApiKey, checkAuth } from '../api';
import { Key, ShieldCheck, ShieldAlert, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const data = await checkAuth();
      setIsAuthenticated(data.authenticated);
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    setLoading(true);
    try {
      await saveApiKey(apiKey);
      toast.success('API Key saved to session');
      setApiKey('');
      checkStatus();
    } catch (error) {
      toast.error('Failed to save API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearApiKey();
      toast.success('Session cleared');
      checkStatus();
    } catch (e) {
      toast.error('Failed to clear session');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="text-blue-500" size={24} />
            <h3 className="font-semibold text-lg">API Authentication</h3>
          </div>
          {isAuthenticated === true ? (
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase">
              <ShieldCheck size={14} /> Active
            </span>
          ) : isAuthenticated === false ? (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full uppercase">
              <ShieldAlert size={14} /> Missing Key
            </span>
          ) : null}
        </div>

        <p className="text-sm text-gray-500">
          Enter your Hero-SMS API Key. It will be stored in a secure HTTP-only cookie for this session only and will not be saved to the server's disk.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your 32-character API key"
              className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="submit"
              disabled={loading || !apiKey}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Save to Session
            </button>
            <button 
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Clear Session"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t dark:border-gray-800">
          <a 
            href="https://hero-sms.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
          >
            Get API Key from Hero-SMS <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-dashed dark:border-gray-800">
        <h3 className="font-semibold mb-2">Security Note</h3>
        <ul className="text-sm text-gray-500 space-y-2 list-disc pl-5">
          <li>API keys are never logged or stored permanently on the server.</li>
          <li>Communication between the browser and server is proxied to protect your key.</li>
          <li>Rate limiting is active to prevent accidental API abuse.</li>
        </ul>
      </section>
    </div>
  );
};

export default Settings;
