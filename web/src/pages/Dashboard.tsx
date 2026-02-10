import { useState, useEffect } from 'react';
import { getBalance } from '../api';
import { RefreshCw, Wallet, Tag, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const data = await getBalance();
      setBalance(data.balance);
      setLastUpdated(new Date().toLocaleTimeString());
      toast.success('Balance updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button 
          onClick={fetchBalance}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-2xl font-bold">{balance !== null ? `${balance} RUB` : '---'}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Last updated: {lastUpdated || 'Never'}</p>
        </div>

        <Link to="/prices" className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <Tag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prices</p>
              <p className="text-lg font-semibold">View Rates</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Check current service prices</p>
        </Link>

        <Link to="/numbers" className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Hash size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Numbers</p>
              <p className="text-lg font-semibold">Buy Number</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Get a new virtual number</p>
        </Link>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Disclaimer:</strong> ใช้เพื่อจัดการบัญชี/เลขที่คุณมีสิทธิ์และการทดสอบระบบของคุณเท่านั้น
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
