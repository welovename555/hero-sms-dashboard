import { useState, useEffect } from 'react';
import { getPrices } from '../api';
import { Search, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Prices = () => {
  const [prices, setPrices] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('0'); // Default Russia for example

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const data = await getPrices(Number(country));
      setPrices(data);
    } catch (error: any) {
      toast.error('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [country]);

  const copyJson = (row: any) => {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    toast.success('JSON copied to clipboard');
  };

  // Prices API usually returns { [countryId]: { [serviceCode]: { cost, count } } }
  const priceList = prices && prices[country] ? Object.entries(prices[country]).map(([service, details]: [string, any]) => ({
    service,
    cost: details.cost,
    count: details.count
  })) : [];

  const filteredPrices = priceList.filter(p => 
    p.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Prices</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search service (e.g. go, wa, tg)..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-800 dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border dark:border-gray-800 dark:bg-gray-900 rounded-lg outline-none"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="0">Russia (0)</option>
          <option value="1">Ukraine (1)</option>
          <option value="2">Kazakhstan (2)</option>
          <option value="6">Indonesia (6)</option>
          <option value="12">USA (12)</option>
          <option value="22">Thailand (22)</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                <th className="px-6 py-4 font-semibold text-sm">Service</th>
                <th className="px-6 py-4 font-semibold text-sm">Price (RUB)</th>
                <th className="px-6 py-4 font-semibold text-sm">Available</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                    <p className="mt-2 text-gray-500">Loading prices...</p>
                  </td>
                </tr>
              ) : filteredPrices.length > 0 ? (
                filteredPrices.map((p) => (
                  <tr key={p.service} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.service}</td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold">{p.cost}</td>
                    <td className="px-6 py-4 text-gray-500">{p.count}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => copyJson(p)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Copy JSON"
                      >
                        <Copy size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Prices;
