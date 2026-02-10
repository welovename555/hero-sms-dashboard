import { useState, useEffect } from 'react';
import { saveApiKey, clearApiKey, checkConfig } from '../api';
import { Key, ShieldCheck, ShieldAlert, Trash2, ExternalLink, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [persist, setPersist] = useState(true);
  const [hasSavedKey, setHasSavedKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const data = await checkConfig();
      setHasSavedKey(data.hasKey);
    } catch (e) {
      setHasSavedKey(false);
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
      await saveApiKey(apiKey, persist);
      toast.success('บันทึก API Key เรียบร้อยแล้ว');
      setApiKey('');
      checkStatus();
    } catch (error) {
      toast.error('ไม่สามารถบันทึก API Key ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('คุณต้องการล้างข้อมูล API Key ทั้งหมดใช่หรือไม่?')) return;
    try {
      await clearApiKey(true);
      toast.success('ล้างข้อมูลเรียบร้อยแล้ว');
      checkStatus();
    } catch (e) {
      toast.error('การดำเนินการล้มเหลว');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold">⚙️ ตั้งค่าระบบ</h2>

      <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="text-blue-500" size={24} />
            <h3 className="font-semibold text-lg">API Authentication</h3>
          </div>
          {hasSavedKey === true ? (
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase">
              <ShieldCheck size={14} /> เชื่อมต่อแล้ว
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full uppercase">
              <ShieldAlert size={14} /> ยังไม่ได้เชื่อมต่อ
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ใส่ API Key 32 หลักของคุณที่นี่"
              className="w-full px-4 py-2 border dark:border-gray-800 dark:bg-gray-950 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="persist" 
              checked={persist} 
              onChange={(e) => setPersist(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="persist" className="text-sm text-gray-600 dark:text-gray-400">
              จดจำ API Key ไว้ในเซิร์ฟเวอร์ (ไม่ต้องกรอกใหม่เมื่อรีเฟรชหน้าเว็บ)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="submit"
              disabled={loading || !apiKey}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save size={18} /> บันทึกการตั้งค่า
            </button>
            <button 
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="ล้างข้อมูล"
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
            รับ API Key จาก Hero-SMS <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">คำแนะนำการใช้งาน</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-5">
          <li>API Key จะถูกใช้เพื่อสื่อสารกับเซิร์ฟเวอร์ Hero-SMS เท่านั้น</li>
          <li>หากเลือก "จดจำ API Key" ระบบจะบันทึกไฟล์ `config.json` ไว้ในโฟลเดอร์โปรเจกต์</li>
          <li>คุณสามารถล้างข้อมูลได้ทุกเมื่อโดยกดปุ่มถังขยะ</li>
        </ul>
      </section>
    </div>
  );
};

export default Settings;
