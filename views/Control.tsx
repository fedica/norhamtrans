
import React, { useState } from 'react';
import { ShieldCheck, Plus, ChevronRight } from 'lucide-react';
import { ControlChecklist } from '../types';
import SignaturePad from '../components/SignaturePad';
import { useTranslation, useAppData } from '../App';
import { format } from 'date-fns';

const ControlView: React.FC = () => {
  const { t } = useTranslation();
  const { drivers, controls, setControls } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    driverId: '',
    safetyNet: false,
    fireExtinguisher: false,
    safeShoes: false,
    cleanliness: false,
    signature: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newControl: ControlChecklist = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      ...formData,
      date: new Date().toISOString()
    };
    setControls([newControl, ...controls]);
    setIsModalOpen(false);
    setFormData({ driverId: '', safetyNet: false, fireExtinguisher: false, safeShoes: false, cleanliness: false, signature: '' });
  };

  const getDriver = (id: string) => drivers.find(d => d.id === id);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-10">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.control}</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Check vor Abfahrt</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white p-2.5 rounded-full shadow-lg active:scale-95 transition-transform"><Plus size={24} strokeWidth={3} /></button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mx-2">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letzte Prüfungen</h2></div>
        <div className="divide-y divide-slate-100">
          {controls.map(control => {
            const driver = getDriver(control.driverId);
            const allGood = control.safetyNet && control.fireExtinguisher && control.safeShoes && control.cleanliness;
            return (
              <div key={control.id} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${allGood ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>{driver ? driver.firstName[0] + driver.lastName[0] : '??'}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{driver ? `${driver.firstName} ${driver.lastName}` : 'Gelöschter Fahrer'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{format(new Date(control.date), 'dd.MM.yyyy • HH:mm')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-1">{[control.safetyNet, control.fireExtinguisher, control.safeShoes, control.cleanliness].map((passed, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-white ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />))}</div>
                  <ChevronRight className="text-slate-300" size={18} />
                </div>
              </div>
            );
          })}
          {controls.length === 0 && <div className="p-16 text-center text-slate-400 font-black text-sm uppercase tracking-widest">Keine Kontrollen aufgezeichnet</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-[30px] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-20 duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3"></div>
            <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between"><h2 className="text-xl font-black">{t.newInspection}</h2><button onClick={() => setIsModalOpen(false)} className="text-red-500 font-bold">{t.cancel}</button></div>
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fahrer wählen</label><select required className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})}><option value="">Suche Fahrer...</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}</select></div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prüfliste Sicherheit</label>
                {[{ key: 'safetyNet', label: t.safetyNet }, { key: 'fireExtinguisher', label: t.extinguisher }, { key: 'safeShoes', label: t.shoes }, { key: 'cleanliness', label: t.cleanliness }].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100 active:bg-slate-200">
                    <span className="text-slate-800 font-bold text-sm">{item.label}</span>
                    <input type="checkbox" className="w-6 h-6 rounded-full border-slate-300 text-blue-600 focus:ring-0" checked={(formData as any)[item.key]} onChange={e => setFormData({...formData, [item.key]: e.target.checked})} />
                  </label>
                ))}
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bestätigung (Unterschrift)</label><SignaturePad onSave={(data) => setFormData({...formData, signature: data})} /></div>
              <button type="submit" disabled={!formData.driverId || !formData.signature} className="w-full bg-[#007AFF] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95 transition-transform">Kontrolle abschließen</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlView;
