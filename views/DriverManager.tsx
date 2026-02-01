
import React, { useState } from 'react';
import { Plus, Search, X, ChevronRight, Tag, User, Edit3, UserPlus, UserCheck, Shirt, RefreshCw, Package, Truck, Calendar } from 'lucide-react';
import { Driver, InventoryType, VehicleStatus, InventoryAssignment } from '../types';
import SignaturePad from '../components/SignaturePad';
import { useTranslation, useAppData } from '../App';
import { format } from 'date-fns';

const DriverManager: React.FC = () => {
  const { t } = useTranslation();
  const { drivers, setDrivers, inventory, setInventory } = useAppData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDetailsId, setViewingDetailsId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAssigningItem, setIsAssigningItem] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState<InventoryType | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    itemId: '',
    signature: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    glsNumber: '',
    phone: '',
    plate: '',
    isBeginner: false
  });

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({ firstName: '', lastName: '', glsNumber: '', phone: '', plate: '', isBeginner: false });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      glsNumber: driver.glsNumber,
      phone: driver.phone,
      plate: driver.plate,
      isBeginner: driver.isBeginner || false
    });
    setIsModalOpen(true);
  };

  const handleOpenEquip = (e: React.MouseEvent, driverId: string) => {
    e.stopPropagation();
    setViewingDetailsId(driverId);
    setItemTypeFilter(InventoryType.CLOTHING);
    setIsAssigningItem(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...d, ...formData } : d));
    } else {
      const newDriver: Driver = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setDrivers([...drivers, newDriver]);
    }
    setIsModalOpen(false);
  };

  const handleReturnItem = (itemId: string, recordId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const record = item.history?.find(h => h.id === recordId);
    if (!record) return;

    setInventory(inventory.map(it => {
      if (it.id === itemId) {
        return {
          ...it,
          quantity: it.quantity + record.quantity,
          history: it.history?.map(h => h.id === recordId ? { ...h, returnedAt: new Date().toISOString() } : h)
        };
      }
      return it;
    }));
  };

  const handleUnassignVehicle = (itemId: string) => {
    setInventory(inventory.map(item => 
      item.id === itemId 
        ? { ...item, assignedTo: undefined, signature: undefined, assignmentDate: undefined, vehicleStatus: VehicleStatus.ACTIVE } 
        : item
    ));
    
    const item = inventory.find(i => i.id === itemId);
    if (item?.type === InventoryType.VEHICLE) {
      setDrivers(drivers.map(d => d.plate === item.plate ? { ...d, plate: '' } : d));
    }
  };

  const handleAssignItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingDetailsId || !assignmentData.itemId) return;

    const assignedItem = inventory.find(i => i.id === assignmentData.itemId);
    if (!assignedItem) return;

    if (assignedItem.type === InventoryType.VEHICLE) {
      let updatedInventory = inventory.map(item => 
        (item.type === InventoryType.VEHICLE && item.assignedTo === viewingDetailsId)
          ? { ...item, assignedTo: undefined, signature: undefined, assignmentDate: undefined, vehicleStatus: VehicleStatus.ACTIVE }
          : item
      );

      updatedInventory = updatedInventory.map(item => 
        item.id === assignmentData.itemId 
          ? { 
              ...item, 
              assignedTo: viewingDetailsId, 
              signature: assignmentData.signature, 
              assignmentDate: assignmentData.date,
              vehicleStatus: VehicleStatus.ALLOCATED
            } 
          : item
      );

      setInventory(updatedInventory);
      if (assignedItem.plate) {
        setDrivers(drivers.map(d => d.id === viewingDetailsId ? { ...d, plate: assignedItem.plate! } : d));
      }
    } else {
      const newRecord: InventoryAssignment = {
        id: 'rec-' + Date.now(),
        driverId: viewingDetailsId,
        itemId: assignedItem.id,
        quantity: assignmentData.quantity,
        date: new Date().toISOString(),
        signature: assignmentData.signature
      };

      setInventory(inventory.map(it => it.id === assignedItem.id ? {
        ...it,
        quantity: Math.max(0, it.quantity - assignmentData.quantity),
        history: [newRecord, ...(it.history || [])]
      } : it));
    }

    setIsAssigningItem(false);
    setItemTypeFilter(null);
    setAssignmentData({ itemId: '', signature: '', date: new Date().toISOString().split('T')[0], quantity: 1 });
  };

  const filteredDrivers = drivers.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.glsNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDriver = drivers.find(d => d.id === viewingDetailsId);
  
  const activeAssignments = viewingDetailsId ? inventory.reduce((acc: any[], item) => {
    if (item.type === InventoryType.VEHICLE && item.assignedTo === viewingDetailsId) {
      acc.push({ ...item, typeLabel: 'Fahrzeug', recordId: null });
    }
    const driverHistory = item.history?.filter(h => h.driverId === viewingDetailsId && !h.returnedAt);
    if (driverHistory && driverHistory.length > 0) {
      driverHistory.forEach(h => {
        acc.push({ ...item, typeLabel: item.type === InventoryType.CLOTHING ? 'Bekleidung' : 'Ausrüstung', recordId: h.id, quantityAssigned: h.quantity, dateAssigned: h.date, signature: h.signature });
      });
    }
    return acc;
  }, []) : [];

  const availableItems = inventory.filter(item => {
    if (itemTypeFilter && item.type !== itemTypeFilter) return false;
    if (item.type === InventoryType.VEHICLE) return !item.assignedTo && item.vehicleStatus !== VehicleStatus.SERVICE;
    return item.quantity > 0;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-10">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.driverManager}</h1>
        <button onClick={handleOpenAdd} className="text-[#007AFF] bg-blue-50 p-2 rounded-full active:scale-95 transition-transform"><Plus size={24} strokeWidth={3} /></button>
      </div>

      <div className="relative mx-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder={t.search} className="w-full pl-9 pr-4 py-2 bg-slate-200/50 rounded-xl focus:outline-none transition-all text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mx-2">
        {filteredDrivers.map((driver, index) => (
          <div key={driver.id} onClick={() => setViewingDetailsId(driver.id)} className={`flex items-center p-4 active:bg-slate-50 transition-colors cursor-pointer ${index !== filteredDrivers.length - 1 ? 'border-b border-slate-100' : ''}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mr-4 border border-slate-200 shadow-inner ${driver.isBeginner ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-[#007AFF]'}`}>{driver.firstName[0]}{driver.lastName[0]}</div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center">
                <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{driver.firstName} {driver.lastName}</h3>
                {driver.isBeginner && <span className="ml-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0">{t.beginner}</span>}
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{driver.glsNumber} <span className="mx-1 text-slate-300">•</span> {driver.plate || 'Kein Fahrzeug'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={(e) => handleOpenEquip(e, driver.id)} className="bg-blue-50 text-[#007AFF] p-2 rounded-xl active:scale-90 transition-transform flex flex-col items-center justify-center">
                <Shirt size={18} /><span className="text-[8px] font-black uppercase mt-0.5">Einkleidung</span>
              </button>
              <ChevronRight className="text-slate-300" size={20} />
            </div>
          </div>
        ))}
      </div>

      {viewingDetailsId && selectedDriver && (
        <div className="fixed inset-0 z-[100] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full rounded-t-[30px] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-20 duration-300 shadow-2xl overflow-hidden">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0"></div>
            <div className="px-6 pb-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">Fahrerprofil</h2>
              <button onClick={() => setViewingDetailsId(null)} className="bg-slate-100 p-2 rounded-full active:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Stammdaten</h4>
                  <button onClick={() => handleOpenEdit(selectedDriver)} className="text-[#007AFF] text-xs font-bold flex items-center"><Edit3 size={14} className="mr-1" /> Bearbeiten</button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 flex justify-between items-center"><span className="text-sm font-bold text-slate-500">Vollständiger Name</span><span className="text-sm font-black text-slate-900">{selectedDriver.firstName} {selectedDriver.lastName}</span></div>
                  <div className="p-4 flex justify-between items-center"><span className="text-sm font-bold text-slate-500">GLS-ID</span><span className="text-sm font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{selectedDriver.glsNumber}</span></div>
                  <div className="p-4 flex justify-between items-center"><span className="text-sm font-bold text-slate-500">Fahrzeug</span><span className="text-sm font-mono font-black text-slate-900">{selectedDriver.plate || 'Nicht zugewiesen'}</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ausrüstung & Bestand</h4>
                  <div className="flex space-x-2">
                    <button onClick={() => { setItemTypeFilter(InventoryType.CLOTHING); setIsAssigningItem(true); }} className="text-[#007AFF] text-[10px] font-black flex items-center bg-blue-50 px-3 py-1.5 rounded-lg uppercase"><Shirt size={14} className="mr-1.5" /> Einkleidung</button>
                    <button onClick={() => { setItemTypeFilter(null); setIsAssigningItem(true); }} className="text-slate-600 text-[10px] font-black flex items-center bg-slate-100 px-3 py-1.5 rounded-lg uppercase"><Plus size={14} className="mr-1.5" /> Ausrüstung</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {activeAssignments.length > 0 ? activeAssignments.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${item.type === InventoryType.CLOTHING ? 'bg-amber-50 text-amber-600' : item.type === InventoryType.VEHICLE ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.type === InventoryType.CLOTHING ? <Tag size={18} /> : item.type === InventoryType.VEHICLE ? <Truck size={18} /> : <Package size={18} />}</div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.typeLabel} {item.size ? `• Gr: ${item.size}` : (item.plate ? `• Kz: ${item.plate}` : `• Menge: ${item.quantityAssigned || 1}`)}</p>
                          </div>
                        </div>
                        {item.type === InventoryType.VEHICLE ? <button onClick={() => handleUnassignVehicle(item.id)} className="p-2 text-slate-300 hover:text-red-500"><RefreshCw size={16} /></button> : !item.isConsumable ? <button onClick={() => handleReturnItem(item.id, item.recordId)} className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md uppercase tracking-tighter flex items-center"><RefreshCw size={10} className="mr-1" /> Rückgabe</button> : <span className="text-[10px] font-black text-blue-400 bg-blue-50 px-2 py-1 rounded uppercase tracking-tighter">Verbrauchsgut</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <div className="flex flex-col"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Empfangsdatum</p><p className="text-xs font-bold text-slate-700">{item.assignmentDate || item.dateAssigned ? format(new Date(item.assignmentDate || item.dateAssigned), 'dd.MM.yyyy') : '---'}</p></div>
                        {item.signature && <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unterschrift</p><img src={item.signature} alt="Sign" className="h-8 w-auto grayscale" /></div>}
                      </div>
                    </div>
                  )) : <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 font-bold text-sm">Keine aktiven Ausgaben.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAssigningItem && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-lg font-black">{itemTypeFilter === InventoryType.CLOTHING ? 'Einkleidung / Ausgabe' : 'Zuweisung'}</h3><button onClick={() => { setIsAssigningItem(false); setItemTypeFilter(null); }} className="text-slate-400"><X size={20} /></button></div>
            <form onSubmit={handleAssignItem} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objekt wählen</label><select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={assignmentData.itemId} onChange={e => setAssignmentData({...assignmentData, itemId: e.target.value})}><option value="">Wählen...</option>{availableItems.map(item => (<option key={item.id} value={item.id}>[{item.type}] {item.name} {item.size ? `[Gr: ${item.size}]` : ''} {item.plate ? `(${item.plate})` : `[Lager: ${item.quantity}]`}</option>))}</select></div>
              {assignmentData.itemId && inventory.find(i => i.id === assignmentData.itemId)?.type !== InventoryType.VEHICLE && (<div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menge</label><input type="number" min="1" max={inventory.find(i => i.id === assignmentData.itemId)?.quantity} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={assignmentData.quantity} onChange={e => setAssignmentData({...assignmentData, quantity: parseInt(e.target.value) || 1})} /></div>)}
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unterschrift (Empfang)</label><SignaturePad onSave={(data) => setAssignmentData({...assignmentData, signature: data})} /></div>
              <button type="submit" disabled={!assignmentData.itemId || !assignmentData.signature} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black shadow-lg disabled:opacity-50">Zuweisung bestätigen</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
           <div className="bg-white w-full rounded-t-[30px] flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-20 duration-300">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3"></div>
              <div className="px-6 pb-4 flex justify-between items-center border-b border-slate-100"><h2 className="text-xl font-black">{editingDriver ? 'Fahrer bearbeiten' : 'Neuen Fahrer anlegen'}</h2><button onClick={() => setIsModalOpen(false)} className="text-[#007AFF] font-bold">Abbrechen</button></div>
              <form onSubmit={handleSaveDriver} className="p-6 overflow-y-auto space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fahrerstatus</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setFormData({...formData, isBeginner: false})} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-bold transition-all ${!formData.isBeginner ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><UserCheck size={16} /> <span>Regulär</span></button>
                    <button type="button" onClick={() => setFormData({...formData, isBeginner: true})} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-bold transition-all ${formData.isBeginner ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}><UserPlus size={16} /> <span>Beifahrer</span></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.firstName}</label><input required className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lastName}</label><input required className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.gls}</label><input required placeholder="Kennung..." className="w-full p-4 bg-slate-100 rounded-xl outline-none font-mono font-bold text-sm" value={formData.glsNumber} onChange={e => setFormData({...formData, glsNumber: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.phone}</label><input required type="tel" className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <button type="submit" className="w-full bg-[#007AFF] text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-transform">Speichern</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default DriverManager;
