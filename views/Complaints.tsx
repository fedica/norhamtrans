
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Search, Plus, User, Truck, MapPin, X, Package } from 'lucide-react';
import { Complaint, Driver } from '../types';
import { useTranslation, useAppData } from '../App';

const ComplaintsView: React.FC = () => {
  const { t } = useTranslation();
  const { complaints, setComplaints, drivers } = useAppData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResolving, setIsResolving] = useState<string | null>(null);
  const [resolvePkgInput, setResolvePkgInput] = useState('');

  const [formData, setFormData] = useState({
    tourNumber: '',
    driverId: '',
    packageNumber: '',
    address: '',
    postalCode: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newComplaint: Complaint = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      resolved: false
    };
    setComplaints([newComplaint, ...complaints]);
    setIsModalOpen(false);
    setFormData({ tourNumber: '', driverId: '', packageNumber: '', address: '', postalCode: '' });
  };

  const handleResolve = () => {
    if (!isResolving) return;
    setComplaints(complaints.map(c => 
      c.id === isResolving ? { ...c, resolved: true, resolvedAt: new Date().toISOString() } : c
    ));
    setIsResolving(null);
    setResolvePkgInput('');
  };

  const getDriverName = (id: string) => {
    const d = drivers.find(d => d.id === id);
    return d ? `${d.firstName} ${d.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.complaints}</h1>
          <p className="text-slate-500">Track tour anomalies and package discrepancies.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg shadow-amber-600/10 transition-all"
        >
          <Plus size={20} />
          <span>{t.newComplaint}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map(complaint => (
          <div key={complaint.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${complaint.resolved ? 'border-emerald-200' : 'border-slate-200 shadow-lg'}`}>
            <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between ${complaint.resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <span>{t.tour} {complaint.tourNumber}</span>
              <span className="flex items-center">
                {complaint.resolved ? (
                  <><CheckCircle2 size={12} className="mr-1" /> {t.resolved}</>
                ) : (
                  <><AlertCircle size={12} className="mr-1" /> {t.pending}</>
                )}
              </span>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Pkg #{complaint.packageNumber}</h3>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <MapPin size={14} className="mr-1.5" />
                    {complaint.address}, {complaint.postalCode}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold border border-slate-200 text-xs">
                  {getDriverName(complaint.driverId).split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{getDriverName(complaint.driverId)}</p>
                </div>
              </div>

              {!complaint.resolved ? (
                <button 
                  onClick={() => setIsResolving(complaint.id)}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10"
                >
                  <CheckCircle2 size={18} />
                  <span>{t.resolved}</span>
                </button>
              ) : (
                <div className="text-center py-2 text-xs text-emerald-600 font-medium bg-emerald-50 rounded-lg">
                  {t.resolved} {new Date(complaint.resolvedAt!).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-[30px] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-20 duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3"></div>
            <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">{t.newComplaint}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-red-500 font-bold">
                {t.cancel}
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t.tour} No</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={formData.tourNumber} onChange={e => setFormData({...formData, tourNumber: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Pkg No</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={formData.packageNumber} onChange={e => setFormData({...formData, packageNumber: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.driverManager}</label>
                <select required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})}>
                  <option value="">{t.search}</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.address}</label>
                <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Zip</label>
                <input required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#007AFF] text-white font-black py-4 rounded-xl mt-4 shadow-xl active:scale-95">{t.save}</button>
            </form>
          </div>
        </div>
      )}

      {isResolving && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.resolved}</h2>
            <p className="text-slate-500 text-sm">Verify package number to confirm.</p>
            <input 
              type="text" 
              placeholder="Pkg #"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-center font-bold"
              value={resolvePkgInput}
              onChange={e => setResolvePkgInput(e.target.value)}
            />
            <div className="flex space-x-3">
              <button onClick={() => setIsResolving(null)} className="flex-1 py-3 font-bold text-red-500">{t.cancel}</button>
              <button onClick={handleResolve} disabled={!resolvePkgInput} className="flex-1 py-3 font-black text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsView;
