import { useState, useEffect } from 'react';
import { getServices, getTopPrices } from '../api';
import { Search, Loader2, Globe, DollarSign, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const Prices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [topCountries, setTopCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        if (Array.isArray(data)) {
          setServices(data);
        } else if (data.services) {
          setServices(data.services);
        }
      } catch (e) {}
    };
    fetchServices();
  }, []);

  const handleCheckPrices = async () => {
    if (!selectedService) return toast.error('กรุณาเลือกบริการ');
    setLoading(true);
    try {
      const data = await getTopPrices(selectedService);
      // Hero-SMS returns an object where keys are country IDs
      const list = Object.entries(data).map(([id, details]: [string, any]) => ({
        id,
        name: details.name || `Country ${id}`,
        count: details.count,
        price: details.price || (details.physicalPriceMap ? Object.values(details.physicalPriceMap)[0] : 'N/A')
      })).sort((a, b) => Number(a.price) - Number(b.price));
      setTopCountries(list);
    } catch (error: any) {
      toast.error('ไม่สามารถดึงข้อมูลราคาได้');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 เปรียบเทียบราคา</h2>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-500">ค้นหาและเลือกบริการ</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="พิมพ์ชื่อบริการ เช่น Telegram, WhatsApp..."
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mt-2"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">-- เลือกบริการ --</option>
              {filteredServices.map(s => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleCheckPrices}
            disabled={loading || !selectedService}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 h-[42px]"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : '🔍 ดูราคา'}
          </button>
        </div>
      </div>

      {topCountries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCountries.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-500" />
                  <span className="font-bold">{c.name}</span>
                </div>
                <span className="text-xs text-gray-400">ID: {c.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <DollarSign size={16} />
                  <span>{c.price} RUB</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Hash size={14} />
                  <span>{c.count} เบอร์</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prices;
