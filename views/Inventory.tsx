
import React, { useState, useMemo, useEffect } from 'react';
import { Package, Plus, Search, Tag, X, History, Calendar, ClipboardCheck, Droplets, Box } from 'lucide-react';
import { format } from 'date-fns';
import { InventoryItem, InventoryType, InventoryAssignment } from '../types';
import SignaturePad from '../components/SignaturePad';
import { useTranslation, useAppData } from '../App';

const InventoryView: React.FC = () => {
  const { t, lang } = useTranslation();
  const { inventory, setInventory, drivers } = useAppData();
  
  const [activeTab, setActiveTab] = useState<InventoryType>(InventoryType.CLOTHING);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const [assignmentData, setAssignmentData] = useState({ driverId: '', signature: '', quantity: 1 });

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [newItemData, setNewItemData] = useState({
    type: InventoryType.CLOTHING,
    name: '',
    size: '',
    quantity: 1,
    brand: '',
    isConsumable: false
  });

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setNewItemData({
      type: item.type,
      name: item.name,
      size: item.size || '',
      quantity: item.quantity,
      brand: item.brand || '',
      isConsumable: item.isConsumable || false
    });
    setIsAddItemModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setNewItemData({
      type: activeTab,
      name: '',
      size: '',
      quantity: 1,
      brand: '',
      isConsumable: activeTab === InventoryType.OTHER ? true : false
    });
    setIsAddItemModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      if (item.type !== activeTab) return false;
      const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [inventory, activeTab, searchTerm]);

  const handleOpenAssign = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setAssignmentData({ driverId: '', signature: '', quantity: 1 });
    setIsAssignModalOpen(true);
  };

  const handleOpenHistory = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItemId) {
      setInventory(inventory.map(item => 
        item.id === editingItemId ? { ...item, ...newItemData } : item
      ));
    } else {
      const newItem: InventoryItem = {
        id: 'i-' + Math.random().toString(36).substr(2, 9),
        ...newItemData,
        history: []
      };
      setInventory([newItem, ...inventory]);
    }
    setIsAddItemModalOpen(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !assignmentData.driverId) return;

    const driver = drivers.find(d => d.id === assignmentData.driverId);
    const plateSnapshot = driver?.plate || '---';

    const newRecord: InventoryAssignment = {
      id: 'rec-' + Date.now(),
      driverId: assignmentData.driverId,
      itemId: selectedItem.id,
      quantity: assignmentData.quantity,
      date: new Date().toISOString(),
      signature: assignmentData.signature,
      driverPlateAtTime: plateSnapshot
    };

    setInventory(inventory.map(it => it.id === selectedItem.id ? {
      ...it,
      quantity: Math.max(0, it.quantity - assignmentData.quantity),
      history: [newRecord, ...(it.history || [])]
    } : it));

    setIsAssignModalOpen(false);
  };

  const getDriverName = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? `${driver.firstName} ${driver.lastName}` : '---';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-10">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.inventory}</h1>
        <button onClick={handleOpenAdd} className="text-[#007AFF] bg-blue-50 p-2 rounded-full active:scale-90 transition-transform"><Plus size={24} /></button>
      </div>

      <div className="mx-2 p-1 bg-slate-200/50 rounded-xl flex">
        {[
          { id: InventoryType.CLOTHING, label: t.clothing, icon: Tag },
          { id: InventoryType.OTHER, label: t.other, icon: Package },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
            <tab.icon size={14} /> <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative mx-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder={t.search} className="w-full pl-9 pr-4 py-2 bg-slate-200/50 rounded-xl focus:outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => handleOpenEdit(item)}
            className={`ios-card border shadow-sm flex flex-col overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-slate-200 bg-white`}
          >
            <div className="p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${item.type === InventoryType.CLOTHING ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {item.type === InventoryType.CLOTHING ? <Tag size={18} /> : <Package size={18} />}
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">Stock: {item.quantity}</span>
                    {item.type === InventoryType.OTHER && (
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter flex items-center ${item.isConsumable ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                         {item.isConsumable ? <Droplets size={10} className="mr-1" /> : <Box size={10} className="mr-1" />}
                         {item.isConsumable ? t.consumable : t.asset}
                       </span>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.name}</h3>
              
              <div className="mt-1 space-y-1">
                {item.size && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {lang === 'de' ? 'Größe' : 'Mărime'}: <span className="text-slate-900">{item.size}</span>
                  </p>
                )}
              </div>
              
              {item.history && item.history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      {item.history.filter(h => !h.returnedAt).slice(0, 3).map((rec, i) => (
                        <div key={i} title={getDriverName(rec.driverId)} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-[#007AFF]">
                          {getDriverName(rec.driverId)[0]}
                        </div>
                      ))}
                   </div>
                   <button onClick={(e) => handleOpenHistory(e, item)} className="text-[10px] font-black text-[#007AFF] uppercase flex items-center">
                      <History size={12} className="mr-1" /> {t.history}
                   </button>
                </div>
              )}
            </div>

            <div className="bg-slate-50/50 p-2 flex space-x-2 border-t border-slate-100">
              <button 
                onClick={(e) => handleOpenAssign(e, item)} 
                disabled={item.quantity <= 0}
                className="flex-1 flex items-center justify-center bg-[#007AFF] text-white py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-40"
              >
                {item.type === InventoryType.CLOTHING ? t.equipping : t.assign}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
           <div className="bg-white w-full rounded-t-[30px] p-6 pb-12 animate-in slide-in-from-bottom-20 duration-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"></div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl font-black">{editingItemId ? t.save : t.save}</h2>
                <button onClick={() => setIsAddItemModalOpen(false)} className="text-red-500 font-bold">{t.cancel}</button>
              </div>
              
              <form onSubmit={handleSaveItem} className="space-y-6 overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">{t.inventory}</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setNewItemData({...newItemData, type: InventoryType.CLOTHING})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${newItemData.type === InventoryType.CLOTHING ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{t.clothing}</button>
                    <button type="button" onClick={() => setNewItemData({...newItemData, type: InventoryType.OTHER, isConsumable: true})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${newItemData.type === InventoryType.OTHER ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{t.other}</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <input placeholder={t.firstName + ' / ' + t.brandLabel} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={newItemData.name} onChange={e => setNewItemData({...newItemData, name: e.target.value})} />
                  {newItemData.type === InventoryType.CLOTHING && <input placeholder={t.size} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={newItemData.size} onChange={e => setNewItemData({...newItemData, size: e.target.value})} />}
                  
                  {newItemData.type === InventoryType.OTHER && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-1">Tip Obiect</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => setNewItemData({...newItemData, isConsumable: true})} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-[10px] font-bold transition-all ${newItemData.isConsumable ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>
                          <Droplets size={12} /> <span>{t.consumable}</span>
                        </button>
                        <button type="button" onClick={() => setNewItemData({...newItemData, isConsumable: false})} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-[10px] font-bold transition-all ${!newItemData.isConsumable ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400'}`}>
                          <Box size={12} /> <span>{t.asset}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1">{t.quantity} (Stock)</label>
                    <input type="number" className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={newItemData.quantity} onChange={e => setNewItemData({...newItemData, quantity: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#007AFF] text-white py-5 font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.97] transition-all">{t.save}</button>
              </form>
           </div>
        </div>
      )}

      {isAssignModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[110] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-[30px] p-6 pb-12 animate-in slide-in-from-bottom-20 duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-black mb-1">{t.confirmAssignment}</h2>
            <p className="text-slate-400 text-xs font-bold mb-6">{selectedItem.name}</p>
            
            <form onSubmit={handleAssignSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">{t.selectDriver}</label>
                <select required className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm appearance-none" value={assignmentData.driverId} onChange={e => setAssignmentData({...assignmentData, driverId: e.target.value})}>
                  <option value="">{t.selectDriver}</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">{t.quantity} (max {selectedItem.quantity})</label>
                <input type="number" min="1" max={selectedItem.quantity} required className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={assignmentData.quantity} onChange={e => setAssignmentData({...assignmentData, quantity: parseInt(e.target.value) || 1})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">{t.signature}</label>
                <SignaturePad onSave={(data) => setAssignmentData({...assignmentData, signature: data})} />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 bg-slate-100 text-red-500 py-4 font-bold rounded-2xl active:bg-slate-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={!assignmentData.driverId || !assignmentData.signature} 
                  className="flex-[2] bg-[#007AFF] text-white py-4 font-black rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  {t.confirmAssignment}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isHistoryModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[110] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
           <div className="bg-white w-full rounded-t-[30px] p-6 pb-12 animate-in slide-in-from-bottom-20 duration-300 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"></div>
              <div className="flex justify-between items-center mb-6 px-1">
                <div>
                  <h2 className="text-xl font-black">Zuweisungshistorie</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedItem.name}</p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="bg-slate-100 p-2 rounded-full"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedItem.history && selectedItem.history.length > 0 ? (
                  selectedItem.history.map((record) => {
                    return (
                      <div key={record.id} className={`bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between ${record.returnedAt ? 'opacity-50 grayscale' : ''}`}>
                         <div className="flex items-center space-x-4">
                            <div className="bg-white w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-xs font-black text-[#007AFF]">
                               {getDriverName(record.driverId)[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900 leading-tight">{getDriverName(record.driverId)}</p>
                               {record.driverPlateAtTime && (
                                 <p className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-1 uppercase tracking-tighter">
                                   {record.driverPlateAtTime}
                                 </p>
                               )}
                               <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter space-x-2 mt-1">
                                  <span className="flex items-center"><Calendar size={10} className="mr-1" /> {format(new Date(record.date), 'dd.MM.yyyy HH:mm')}</span>
                                  <span className="flex items-center"><ClipboardCheck size={10} className="mr-1" /> Qty: {record.quantity}</span>
                                  {(record.returnedAt || selectedItem.isConsumable) && (
                                    <span className={`px-1 rounded ${selectedItem.isConsumable ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                      {selectedItem.isConsumable ? t.resolved : t.returned}
                                    </span>
                                  )}
                               </div>
                            </div>
                         </div>
                         {record.signature && (
                           <img src={record.signature} alt="Sign" className="h-8 w-auto grayscale opacity-60" />
                         )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center text-slate-300 font-black italic">Keine Einträge gefunden.</div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
