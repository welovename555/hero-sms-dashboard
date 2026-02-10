import { useState, useEffect, useRef } from 'react';
import { getOrderStatus, getActiveOrders, setOrderStatus } from '../api';
import { RefreshCw, Copy, Clock, Play, Square, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '');
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalTime, setIntervalTime] = useState(5);
  const timerRef = useRef<any>(null);

  const fetchActiveOrders = async () => {
    try {
      const data = await getActiveOrders();
      setActiveOrders(data.activeActivations || []);
    } catch (e) {}
  };

  const checkStatus = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const data = await getOrderStatus(selectedId);
      setStatusData(data);
      if (data.status === 'ok') {
        setAutoRefresh(false);
        toast.success('ได้รับรหัสยืนยันแล้ว!');
      }
    } catch (error: any) {
      // toast.error('ไม่สามารถดึงสถานะได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  useEffect(() => {
    if (selectedId) {
      checkStatus();
      // Auto start refresh when selecting a new order if it's not already finished
      if (statusData?.status !== 'ok') {
        setAutoRefresh(true);
      }
    }
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
    toast.success('คัดลอกแล้ว');
  };

  const handleAction = async (status: number) => {
    try {
      await setOrderStatus(selectedId, status);
      toast.success('ดำเนินการเรียบร้อย');
      checkStatus();
      fetchActiveOrders();
    } catch (e) {
      toast.error('การดำเนินการล้มเหลว');
    }
  };

  const currentOrder = activeOrders.find(o => o.activationId === selectedId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📩 ข้อความ (Inbox)</h2>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">เลือกเบอร์ที่ต้องการดู</label>
            <select 
              className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- เลือกรายการ --</option>
              {activeOrders.map(o => (
                <option key={o.activationId} value={o.activationId}>
                  +{o.phoneNumber} ({o.serviceCode.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-500">รีเฟรชอัตโนมัติ (วินาที)</label>
              <input 
                type="number" 
                min="3" 
                max="60"
                value={intervalTime}
                onChange={(e) => setIntervalTime(Number(e.target.value))}
                className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={!selectedId || statusData?.status === 'ok'}
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-colors h-[42px] min-w-[140px] ${
                autoRefresh 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              } disabled:opacity-50`}
            >
              {autoRefresh ? <Square size={18} /> : <Play size={18} />}
              {autoRefresh ? 'หยุด' : 'เริ่มดึงข้อมูล'}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t dark:border-gray-800">
          {!selectedId ? (
            <div className="py-12 text-center text-gray-500 border-2 border-dashed dark:border-gray-800 rounded-xl">
              กรุณาเลือกเบอร์โทรศัพท์เพื่อดูข้อความ
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">สถานะปัจจุบัน</p>
                    <p className="text-lg font-bold uppercase text-blue-600 dark:text-blue-400">
                      {statusData?.status === 'waiting' ? '⏳ กำลังรอ SMS...' : 
                       statusData?.status === 'ok' ? '✅ ได้รับรหัสแล้ว' : 
                       statusData?.status || 'กำลังตรวจสอบ...'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={checkStatus} 
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {statusData?.status === 'ok' ? (
                <div className="p-8 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl text-center space-y-4">
                  <p className="text-sm text-green-600 dark:text-green-400 font-bold tracking-widest uppercase">Verification Code</p>
                  <p className="text-6xl font-mono font-black text-green-700 dark:text-green-300 tracking-tighter">{statusData.code}</p>
                  <button 
                    onClick={() => copyText(statusData.code)}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors"
                  >
                    <Copy size={18} /> คัดลอกรหัส
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center space-y-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed dark:border-gray-800">
                  <Loader2 className="animate-spin mx-auto text-blue-500" size={48} />
                  <p className="text-gray-500 font-medium">ระบบกำลังรอข้อความ SMS เข้ามายังเบอร์ +{currentOrder?.phoneNumber}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(6)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={20} /> ยืนยันสำเร็จ (Complete)
                </button>
                <button 
                  onClick={() => handleAction(8)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  <XCircle size={20} /> ยกเลิกเบอร์นี้ (Cancel)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
