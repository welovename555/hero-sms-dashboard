import { useState, useEffect } from 'react';
import { buyNumber, getActiveOrders, setOrderStatus, getServices, getCountries } from '../api';
import { ShoppingCart, RefreshCw, CheckCircle, XCircle, MessageSquare, Loader2, Globe, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Numbers = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState('66'); // Default Thailand
  const [selectedService, setSelectedService] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, servicesData, countriesData] = await Promise.all([
        getActiveOrders(),
        getServices(),
        getCountries()
      ]);
      setOrders(ordersData.activeActivations || []);
      setServices(Array.isArray(servicesData) ? servicesData : servicesData.services || []);
      setCountries(countriesData);
    } catch (error: any) {
      // toast.error('ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return toast.error('กรุณาเลือกบริการ');
    
    setBuying(true);
    try {
      const order = await buyNumber(Number(selectedCountry), selectedService);
      toast.success(`ซื้อเบอร์สำเร็จ: +${order.number}`);
      fetchData();
      // Auto navigate to messages for the new number
      navigate(`/messages?id=${order.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'การซื้อล้มเหลว');
    } finally {
      setBuying(false);
    }
  };

  const handleAction = async (id: string, status: number) => {
    try {
      await setOrderStatus(id, status);
      toast.success('อัปเดตสถานะเรียบร้อย');
      fetchData();
    } catch (error: any) {
      toast.error('การดำเนินการล้มเหลว');
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">🚀 ซื้อเบอร์ใหม่</h2>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
          <form onSubmit={handleBuy} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Globe size={16} /> ประเทศ
              </label>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.eng} ({c.id})</option>
                ))}
                {countries.length === 0 && <option value="66">Thailand (66)</option>}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Tag size={16} /> บริการ
              </label>
              <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือกบริการ --</option>
                {services.map(s => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <button 
              type="submit"
              disabled={buying || !selectedService}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 h-[42px] font-bold"
            >
              {buying ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
              ซื้อเบอร์
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📱 เบอร์ที่กำลังใช้งาน</h2>
          <button onClick={fetchData} className="text-gray-500 hover:text-blue-500 transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && orders.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.activationId} className="bg-white dark:bg-gray-900 p-5 rounded-xl border dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">ID: {order.activationId}</p>
                    <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">+{order.phoneNumber}</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">{order.serviceCode.toUpperCase()}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full font-bold">
                    รอ SMS...
                  </span>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => navigate(`/messages?id=${order.activationId}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors font-bold"
                  >
                    <MessageSquare size={18} /> ดูข้อความ
                  </button>
                  <button 
                    onClick={() => handleAction(order.activationId, 6)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="เสร็จสิ้น"
                  >
                    <CheckCircle size={22} />
                  </button>
                  <button 
                    onClick={() => handleAction(order.activationId, 8)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="ยกเลิก"
                  >
                    <XCircle size={22} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed dark:border-gray-800">
              ไม่มีเบอร์ที่กำลังใช้งานในขณะนี้
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Numbers;
