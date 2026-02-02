
import React, { useState, useMemo, useEffect } from 'react';
import { Truck, Plus, Search, X, Wrench, RefreshCw, AlertCircle, User, AlertTriangle } from 'lucide-react';
import { format, isPast, differenceInDays, parseISO } from 'date-fns';
import { InventoryItem, InventoryType, VehicleStatus } from '../types.ts';
import SignaturePad from '../components/SignaturePad.tsx';
import { useTranslation, useAppData } from '../App.tsx';

const VehiclesView: React.FC = () => {
  const { t } = useTranslation();
  const { inventory, setInventory, drivers, setDrivers } = useAppData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [assignmentData, setAssignmentData] = useState({ driverId: '', signature: '', quantity: 1 });
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [plateParts, setPlateParts] = useState({ city: '', letters: '', numbers: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newItemData, setNewItemData] = useState({
    type: InventoryType.VEHICLE,
    name: '',
    plate: '',
    huExpiration: '',
    vehicleStatus: VehicleStatus.ACTIVE
  });

  const filteredVehicles = useMemo(() => {
    return inventory.filter(item => {
      if (item.type !== InventoryType.VEHICLE) return false;
      const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.plate && item.plate.toLowerCase().includes(searchTerm.toLowerCase()));
      return searchMatch;
    });
  }, [inventory, searchTerm]);

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setNewItemData({
      type: InventoryType.VEHICLE,
      name: item.name,
      plate: item.plate || '',
      huExpiration: item.huExpiration || '',
      vehicleStatus: item.vehicleStatus || VehicleStatus.ACTIVE
    });
    
    if (item.plate) {
      const parts = item.plate.split(' ');
      setPlateParts({
        city: parts[0] || '',
        letters: parts[1] || '',
        numbers: parts[2] || ''
      });
    }
    setIsAddItemModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setNewItemData({
      type: InventoryType.VEHICLE,
      name: '',
      plate: '',
      huExpiration: '',
      vehicleStatus: VehicleStatus.ACTIVE
    });
    setPlateParts({ city: '', letters: '', numbers: '' });
    setIsAddItemModalOpen(true);
  };

  useEffect(() => {
    const combined = `${plateParts.city.toUpperCase()} ${plateParts.letters.toUpperCase()} ${plateParts.numbers}`;
    setNewItemData(prev => ({ ...prev, plate: combined.trim() }));
  }, [plateParts]);

  const handleStatusChange = async (itemId: string, newStatus: VehicleStatus, location?: string) => {
    const item = inventory.find(i => i.id === itemId);
    
    setInventory(prev => prev.map(i => i.id === itemId ? {
      ...i,
      vehicleStatus: newStatus,
      serviceLocation: location || undefined,
      assignedTo: undefined,
      signature: undefined,
      assignmentDate: undefined
    } : i));

    if (item?.plate) {
      setDrivers(prev => prev.map(d => d.plate === item.plate ? { ...d, plate: '' } : d));
    }
    setIsServiceMenuOpen(null);
  };

  const handleUnassignVehicle = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = inventory.find(i => i.id === itemId);
    
    setInventory(prev => prev.map(i => i.id === itemId ? {
      ...i,
      assignedTo: undefined,
      signature: undefined,
      assignmentDate: undefined,
      vehicleStatus: VehicleStatus.ACTIVE
    } : i));

    if (item?.plate) {
      setDrivers(prev => prev.map(d => d.plate === item.plate ? { ...d, plate: '' } : d));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateParts.city || !plateParts.letters || !plateParts.numbers) return;

    const itemToSave: InventoryItem = {
      id: editingItemId || 'i-' + Math.random().toString(36).substr(2, 9),
      ...newItemData,
      quantity: 1,
      history: editingItemId ? inventory.find(i => i.id === editingItemId)?.history || [] : []
    };
    
    if (editingItemId) {
      setInventory(prev => prev.map(i => i.id === editingItemId ? itemToSave : i));
    } else {
      setInventory(prev => [itemToSave, ...prev]);
    }
    setIsAddItemModalOpen(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !assignmentData.driverId) return;

    const targetDriver = drivers.find(d => d.id === assignmentData.driverId);
    
    // Clear old vehicle if driver had one
    if (targetDriver?.plate) {
      setInventory(prev => prev.map(v => v.plate === targetDriver.plate ? {
        ...v,
        assignedTo: undefined,
        signature: undefined,
        assignmentDate: undefined,
        vehicleStatus: VehicleStatus.ACTIVE
      } : v));
    }

    // Assign new
    setInventory(prev => prev.map(i => i.id === selectedItem.id ? {
      ...i,
      assignedTo: assignmentData.driverId,
      signature: assignmentData.signature,
      assignmentDate: new Date().toISOString(),
      vehicleStatus: VehicleStatus.ALLOCATED
    } : i));

    if (selectedItem.plate) {
      setDrivers(prev => prev.map(d => d.id === assignmentData.driverId ? { ...d, plate: selectedItem.plate || '' } : d));
    }

    setIsAssignModalOpen(false);
  };

  const getDriverName = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? `${driver.firstName} ${driver.lastName}` : '---';
  };

  const getStatusColor = (item: InventoryItem) => {
    let isUrgent = false;
    if (item.huExpiration) {
        const expiryDate = parseISO(item.huExpiration);
        const daysLeft = differenceInDays(expiryDate, new Date());
        if (daysLeft <= 30) isUrgent = true;
    }

    if (isUrgent) return 'border-red-400 bg-red-50 ring-2 ring-red-200 ring-inset shadow-lg';

    switch (item.vehicleStatus) {
      case VehicleStatus.ACTIVE: return 'border-emerald-200 bg-emerald-50/20';
      case VehicleStatus.ALLOCATED: return 'border-amber-200 bg-amber-50/20';
      case VehicleStatus.SERVICE: return 'border-red-200 bg-red-50/20';
      default: return 'border-slate-200 bg-white';
    }
  };

  // Only show drivers who do not already have an assigned vehicle plate
  const availableDrivers = drivers.filter(d => !d.plate);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-10">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.vehicles}</h1>
        <button onClick={handleOpenAdd} className="text-[#007AFF] bg-blue-50 p-2 rounded-full active:scale-90 transition-transform"><Plus size={24} /></button>
      </div>

      <div className="relative mx-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder={t.search} className="w-full pl-9 pr-4 py-2 bg-slate-200/50 rounded-xl focus:outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 pb-20">
        {filteredVehicles.map(item => {
          const expiryDate = item.huExpiration ? parseISO(item.huExpiration) : null;
          const daysLeft = expiryDate ? differenceInDays(expiryDate, new Date()) : null;
          const isHUExpired = expiryDate && isPast(expiryDate);
          const isHUNear = daysLeft !== null && daysLeft <= 30;
          const isInService = item.vehicleStatus === VehicleStatus.SERVICE;
          
          return (
            <div 
              key={item.id} 
              onClick={() => handleOpenEdit(item)}
              className={`ios-card border shadow-sm flex flex-col overflow-hidden active:scale-[0.98] transition-all cursor-pointer ${getStatusColor(item)}`}
            >
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${isInService ? 'bg-red-100 text-red-600' : isHUNear ? 'bg-red-500 text-white' : item.vehicleStatus === VehicleStatus.ALLOCATED ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isHUNear && !isInService ? <AlertTriangle size={18} /> : <Truck size={18} />}
                  </div>
                  <div className="flex flex-col items-end">
                    {item.huExpiration && (
                      <div className="flex flex-col items-end">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center mb-1 ${isHUExpired ? 'bg-red-600 text-white' : isHUNear ? 'bg-amber-500 text-white shadow-sm animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                          <AlertCircle size={10} className="mr-1" /> HU: {format(expiryDate!, 'MM/yyyy')}
                        </span>
                        {isHUNear && !isHUExpired && (
                           <p className="text-[8px] font-black text-red-600 uppercase tracking-tighter">
                             {t.dueIn} {daysLeft} {t.days}
                           </p>
                        )}
                        {isHUExpired && (
                           <p className="text-[8px] font-black text-red-600 uppercase tracking-tighter animate-bounce">
                             {t.huExpired}
                           </p>
                        )}
                      </div>
                    )}
                    {isInService && (
                      <span className="text-[8px] font-black uppercase tracking-tighter bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                        {item.serviceLocation || 'IN SERVICE'}
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.name}</h3>
                
                <div className="mt-1">
                  <p className={`text-xs font-mono font-black px-2 py-0.5 rounded-md inline-block ${isInService ? 'bg-red-100 text-red-700' : isHUNear ? 'bg-red-100 text-red-800' : item.vehicleStatus === VehicleStatus.ALLOCATED ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.plate}
                  </p>
                </div>

                {item.assignedTo && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#007AFF] text-[10px] font-bold">
                      {getDriverName(item.assignedTo).split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{getDriverName(item.assignedTo)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.assignmentDate ? format(parseISO(item.assignmentDate), 'dd.MM.yyyy') : 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 p-2 flex space-x-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                {isInService ? (
                  <button onClick={() => handleStatusChange(item.id, VehicleStatus.ACTIVE)} className="flex-1 flex items-center justify-center bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md">
                    <RefreshCw size={14} className="mr-2" /> {t.returnFromService}
                  </button>
                ) : (
                  <>
                    {!item.assignedTo ? (
                      <button onClick={() => { setSelectedItem(item); setIsAssignModalOpen(true); }} className="flex-1 flex items-center justify-center bg-[#007AFF] text-white py-2.5 rounded-xl text-xs font-bold shadow-md">
                        <User size={14} className="mr-2" /> {t.assign}
                      </button>
                    ) : (
                      <button onClick={(e) => handleUnassignVehicle(e, item.id)} className="flex-1 flex items-center justify-center bg-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold">
                        <X size={14} className="mr-2" /> {t.reallocate}
                      </button>
                    )}
                    <div className="relative">
                      <button 
                        onClick={() => setIsServiceMenuOpen(isServiceMenuOpen === item.id ? null : item.id)} 
                        className={`p-2.5 rounded-xl transition-colors ${isServiceMenuOpen === item.id ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}
                      >
                        <Wrench size={16} />
                      </button>
                      {isServiceMenuOpen === item.id && (
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[50] animate-in slide-in-from-bottom-22">
                          <div className="p-2 space-y-1">
                            <button onClick={() => handleStatusChange(item.id, VehicleStatus.SERVICE, t.serviceDealer)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center">
                              <Wrench size={14} className="mr-2 text-slate-400" /> {t.serviceDealer}
                            </button>
                            <button onClick={() => handleStatusChange(item.id, VehicleStatus.SERVICE, t.serviceOrhan)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center">
                              <Wrench size={14} className="mr-2 text-slate-400" /> {t.serviceOrhan}
                            </button>
                            <button onClick={() => handleStatusChange(item.id, VehicleStatus.SERVICE, t.serviceOhm)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center">
                              <Wrench size={14} className="mr-2 text-slate-400" /> {t.serviceOhm}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {['MB Sprinter', 'IVECO Daily'].map(model => (
                      <button key={model} type="button" onClick={() => setNewItemData({...newItemData, name: model})} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${newItemData.name === model ? 'border-[#007AFF] bg-blue-50 text-[#007AFF]' : 'border-slate-100 text-slate-500'}`}>{model}</button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input placeholder="B" maxLength={3} className="w-20 p-3 bg-slate-100 rounded-xl outline-none font-bold text-center uppercase" value={plateParts.city} onChange={e => setPlateParts({...plateParts, city: e.target.value.replace(/[^a-zA-Z]/g, '')})} />
                    <span className="text-slate-300">-</span>
                    <input placeholder="NT" maxLength={2} className="w-16 p-3 bg-slate-100 rounded-xl outline-none font-bold text-center uppercase" value={plateParts.letters} onChange={e => setPlateParts({...plateParts, letters: e.target.value.replace(/[^a-zA-Z]/g, '')})} />
                    <span className="text-slate-300">-</span>
                    <input placeholder="1234" maxLength={4} type="number" className="flex-1 p-3 bg-slate-100 rounded-xl outline-none font-bold text-center" value={plateParts.numbers} onChange={e => setPlateParts({...plateParts, numbers: e.target.value})} />
                  </div>
                  <input type="date" className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm" value={newItemData.huExpiration} onChange={e => setNewItemData({...newItemData, huExpiration: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#007AFF] text-white py-5 font-black rounded-2xl shadow-xl active:scale-[0.97] transition-all">
                  {isSubmitting ? '...' : t.save}
                </button>
              </form>
           </div>
        </div>
      )}

      {isAssignModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[110] bg-black/40 ios-blur flex items-end animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-[30px] p-6 pb-12 animate-in slide-in-from-bottom-20 duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-black mb-1">{t.confirmAssignment}</h2>
            <p className="text-slate-400 text-xs font-bold mb-6">{selectedItem.name} ({selectedItem.plate})</p>
            
            <form onSubmit={handleAssignSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">{t.selectDriver}</label>
                <select required className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold text-sm appearance-none" value={assignmentData.driverId} onChange={e => setAssignmentData({...assignmentData, driverId: e.target.value})}>
                  <option value="">{t.selectDriver}</option>
                  {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </select>
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
                  disabled={!assignmentData.driverId || !assignmentData.signature || isSubmitting} 
                  className="flex-[2] bg-[#007AFF] text-white py-4 font-black rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? '...' : t.confirmAssignment}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesView;
