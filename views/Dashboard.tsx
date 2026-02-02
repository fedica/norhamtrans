
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  Map as MapIcon,
  ChevronRight,
  ClipboardCheck,
  Wrench,
  Clock,
  LayoutGrid,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useTranslation, useAppData, useAuth } from '../App';
import { VehicleStatus, InventoryType } from '../types';
import { differenceInDays, isPast, parseISO } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { drivers, complaints, tours, inventory } = useAppData();
  const { user } = useAuth();

  // Practical metrics calculations
  const pendingComplaints = complaints.filter(c => !c.resolved).length;
  const vehiclesInService = inventory.filter(i => i.vehicleStatus === VehicleStatus.SERVICE).length;
  const inventoryItemsCount = inventory.filter(i => i.type !== InventoryType.VEHICLE).length;

  // Maintenance Notification Logic
  const maintenanceAlerts = useMemo(() => {
    return inventory
      .filter(item => item.type === InventoryType.VEHICLE && item.huExpiration)
      .map(v => {
        const expiryDate = parseISO(v.huExpiration!);
        const daysLeft = differenceInDays(expiryDate, new Date());
        const expired = isPast(expiryDate);
        return { ...v, daysLeft, expired };
      })
      .filter(v => v.expired || v.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [inventory]);

  // Reordered Quick Stats per request: Lager, Abfahrt, Rekla, Service
  const quickStats = [
    { label: t.other, value: inventoryItemsCount, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/inventory' },
    { label: 'Abfahrt', value: 'Check', icon: ClipboardCheck, color: 'text-slate-900', bg: 'bg-slate-100', path: '/control' },
    { label: 'Rekla', value: pendingComplaints, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', path: '/complaints' },
    { label: 'Service', value: vehiclesInService, icon: Wrench, color: 'text-red-600', bg: 'bg-red-50', path: '/vehicles' },
  ];

  const primaryActions = [
    { 
      id: 'tours', 
      name: t.tourManager, 
      desc: 'Disposition', 
      icon: MapIcon, 
      path: '/tours', 
      color: 'bg-blue-600' 
    },
    { 
      id: 'control', 
      name: t.control, 
      desc: 'Sicherheitscheck', 
      icon: ClipboardCheck, 
      path: '/control', 
      color: 'bg-slate-900' 
    },
    { 
      id: 'drivers', 
      name: t.driverManager, 
      desc: 'Personal', 
      icon: Users, 
      path: '/drivers', 
      color: 'bg-indigo-500' 
    },
    { 
      id: 'inventory', 
      name: t.inventory, 
      desc: 'Bestand', 
      icon: Package, 
      path: '/inventory', 
      color: 'bg-emerald-500' 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Welcome Header - Personalized and Lowercase welcome */}
      <div className="flex items-center justify-between px-1 pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none lowercase">
            {t.welcome} <span className="text-blue-600">{user?.firstName || 'Admin'}</span>
          </h1>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-2">
          <Clock size={14} className="text-blue-600" />
          <span className="text-xs font-black text-slate-900">
            {new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Quick Metrics (Lager, Abfahrt, Rekla, Service) - Prim Plan */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {quickStats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center active:scale-95 transition-all"
          >
            <div className={`p-2 ${stat.bg} ${stat.color} rounded-xl mb-1`}>
              <stat.icon size={16} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-black text-slate-900 leading-none">{stat.value}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1 truncate w-full">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Maintenance Notification Area - Now below the four options */}
      {maintenanceAlerts.length > 0 && (
        <div className="px-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center">
              <Bell size={12} className="mr-1.5 animate-bounce" /> {t.maintenanceAlerts}
            </h2>
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {maintenanceAlerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {maintenanceAlerts.slice(0, 2).map((alert) => (
              <div 
                key={alert.id} 
                onClick={() => navigate('/vehicles')}
                className={`p-4 rounded-2xl border flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm ${alert.expired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${alert.expired ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-tight ${alert.expired ? 'text-red-700' : 'text-amber-700'}`}>
                      {alert.expired ? t.huExpired : t.huSoon}
                    </p>
                    <p className="text-sm font-bold text-slate-900">Kennzeichen: {alert.plate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-tighter ${alert.expired ? 'text-red-600' : 'text-amber-600'}`}>
                    {alert.expired ? t.expiredLabel : `${t.dueIn} ${alert.daysLeft} ${t.days}`}
                  </p>
                  <ChevronRight size={14} className="text-slate-300 ml-auto mt-1" />
                </div>
              </div>
            ))}
            {maintenanceAlerts.length > 2 && (
              <button onClick={() => navigate('/vehicles')} className="w-full text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500">
                + {maintenanceAlerts.length - 2} weitere Warnungen anzeigen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Focus / Quick Actions */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            <LayoutGrid size={12} className="mr-1.5" /> Fokus Heute
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col items-start active:scale-[0.97] transition-all shadow-sm group"
            >
              <div className={`${action.color} text-white p-2.5 rounded-xl shadow-lg mb-3 group-active:scale-90 transition-transform`}>
                <action.icon size={20} />
              </div>
              <h3 className="font-black text-slate-900 text-sm leading-tight">{action.name}</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed / System Health */}
      <div className="px-1">
        <div className="bg-slate-900 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="text-blue-400" size={20} />
              <h3 className="text-white font-black text-base">Flotten-Bereitschaft</h3>
            </div>
            <span className="flex items-center bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
              Optimal
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white/40 text-[8px] font-black uppercase mb-1">Auslastung</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-black text-white">92</span>
                <span className="text-[10px] text-white/60 font-bold">%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-400 h-full w-[92%] rounded-full"></div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white/40 text-[8px] font-black uppercase mb-1">Performance</p>
              <div className="flex items-baseline space-x-1">
                <TrendingUp size={14} className="text-emerald-400 mr-1" />
                <span className="text-lg font-black text-white">Top</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full w-[100%] rounded-full"></div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/complaints')}
            className="w-full mt-6 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-xs active:scale-[0.98] transition-transform shadow-lg flex items-center justify-center"
          >
            Aktuelle Reklamationen prüfen <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
