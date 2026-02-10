import { useState, useEffect } from 'react';
import { buyNumber, getOrders, setOrderStatus } from '../api';
import { ShoppingCart, RefreshCw, CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Numbers = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  
  // Form state
  const [country, setCountry] = useState('0');
  const [service, setService] = useState('');
  const [operator, setOperator] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      // API returns { activeActivations: [...] } or similar
      setOrders(data.activeActivations || []);
    } catch (error: any) {
      // toast.error('Failed to fetch active orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return toast.error('Please enter a service code');
    
    setBuying(true);
    try {
      const order = await buyNumber(Number(country), service, operator);
      toast.success(`Bought number: ${order.number}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  const handleAction = async (id: string, status: number) => {
    try {
      await setOrderStatus(id, status);
      toast.success('Status updated');
      fetchOrders();
    } catch (error: any) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Buy Number</h2>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
          <form onSubmit={handleBuy} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Country ID</label>
              <input 
                type="number" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Service Code (e.g. tg, wa)</label>
              <input 
                type="text" 
                value={service} 
                onChange={(e) => setService(e.target.value)}
                placeholder="tg"
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Operator (Optional)</label>
              <input 
                type="text" 
                value={operator} 
                onChange={(e) => setOperator(e.target.value)}
                placeholder="any"
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit"
              disabled={buying}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 h-[42px]"
            >
              {buying ? <Loader2 className="animate-spin" size={18} /> : <ShoppingCart size={18} />}
              Buy Now
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active Orders</h2>
          <button onClick={fetchOrders} className="text-gray-500 hover:text-blue-500 transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-sm">ID</th>
                  <th className="px-6 py-4 font-semibold text-sm">Number</th>
                  <th className="px-6 py-4 font-semibold text-sm">Service</th>
                  <th className="px-6 py-4 font-semibold text-sm">Status</th>
                  <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.activationId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{order.activationId}</td>
                      <td className="px-6 py-4 font-bold">+{order.phoneNumber}</td>
                      <td className="px-6 py-4 uppercase">{order.serviceCode}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full font-medium">
                          Waiting SMS
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => navigate(`/messages?id=${order.activationId}`)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Messages"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(order.activationId, 6)}
                          className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Complete"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(order.activationId, 8)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No active orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Numbers;
