import { useState, useEffect, useRef } from 'react';
import { getOrderStatus, getOrders } from '../api';
import { RefreshCw, Copy, Clock, Play, Square, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalTime, setIntervalTime] = useState(10);
  const timerRef = useRef<any>(null);

  const fetchActiveOrders = async () => {
    try {
      const data = await getOrders();
      setActiveOrders(data.activeActivations || []);
    } catch (e) {}
  };

  const checkStatus = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const data = await getOrderStatus(selectedId);
      setStatus(data.status);
    } catch (error: any) {
      toast.error('Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  useEffect(() => {
    if (selectedId) checkStatus();
  }, [selectedId]);

  useEffect(() => {
    if (autoRefresh && selectedId) {
      timerRef.current = setInterval(checkStatus, intervalTime * 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, selectedId, intervalTime]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Parse status: STATUS_WAIT_CODE, STATUS_OK:code
  const isCodeReceived = status.startsWith('STATUS_OK:');
  const code = isCodeReceived ? status.split(':')[1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Messages (Inbox)</h2>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Select Active Order</label>
            <select 
              className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Select an order --</option>
              {activeOrders.map(o => (
                <option key={o.activationId} value={o.activationId}>
                  ID: {o.activationId} (+{o.phoneNumber}) - {o.serviceCode}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-500">Auto Refresh (sec)</label>
              <input 
                type="number" 
                min="5" 
                max="60"
                value={intervalTime}
                onChange={(e) => setIntervalTime(Number(e.target.value))}
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={!selectedId}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors h-[42px] ${
                autoRefresh 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              } disabled:opacity-50`}
            >
              {autoRefresh ? <Square size={18} /> : <Play size={18} />}
              {autoRefresh ? 'Stop' : 'Start Auto'}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Status / Message</h3>
            <button 
              onClick={checkStatus} 
              disabled={loading || !selectedId}
              className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {!selectedId ? (
            <div className="py-12 text-center text-gray-500 border-2 border-dashed dark:border-gray-800 rounded-xl">
              Please select an order to view messages
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm font-medium uppercase">{status || 'Checking...'}</span>
                </div>
                {isCodeReceived && (
                  <button 
                    onClick={() => copyText(code!)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    <Copy size={16} />
                    Copy Code
                  </button>
                )}
              </div>

              {isCodeReceived ? (
                <div className="p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center">
                  <p className="text-sm text-blue-500 mb-2 uppercase font-semibold tracking-wider">Verification Code</p>
                  <p className="text-5xl font-mono font-bold text-blue-600 dark:text-blue-400">{code}</p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Loader2 className="animate-spin mx-auto text-gray-300 mb-4" size={40} />
                  <p className="text-gray-500">Waiting for incoming SMS...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
