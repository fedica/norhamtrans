
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Package, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  Map as MapIcon,
  ChevronRight,
  ClipboardCheck,
  Wrench
} from 'lucide-react';
import { useTranslation, useAppData } from '../App';
import { VehicleStatus } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { drivers, complaints, tours, inventory, controls } = useAppData();

  // Practical metrics calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const toursToday = tours.filter(t => t.date === todayStr).length;
  const activeDrivers = drivers.length;
  const pendingComplaints = complaints.filter(c => !c.resolved).length;
  const vehiclesInService = inventory.filter(i => i.vehicleStatus === VehicleStatus.SERVICE).length;

  const quickStats = [
    { label: 'Touren Heute', value: toursToday, icon: MapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Fahrer Aktiv', value: activeDrivers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Reklamationen', value: pendingComplaints, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Im Service', value: vehiclesInService, icon: Wrench, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const primaryActions = [
    { 
      id: 'tours', 
      name: t.tourManager, 
      desc: 'Disposition & Planung', 
      icon: MapIcon, 
      path: '/tours', 
      color: 'bg-[#007AFF]' 
    },
    { 
      id: 'drivers', 
      name: t.driverManager, 
      desc: 'Personalverwaltung', 
      icon: Users, 
      path: '/drivers', 
      color: 'bg-indigo-500' 
    },
    { 
      id: 'control', 
      name: 'Abfahrtskontrolle', 
      desc: 'Sicherheits-Check', 
      icon: ClipboardCheck, 
      path: '/control', 
      color: 'bg-slate-900' 
    },
    { 
      id: 'inventory', 
      name: t.inventory, 
      desc: 'Flotte & Lager', 
      icon: Package, 
      path: '/inventory', 
      color: 'bg-emerald-500' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Header Section */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t.welcome.split(' ')[0]} <span className="text-blue-600 font-black">Admin</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Zentrale norhamtrans Leitstelle
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase">{new Date().toLocaleDateString('de-DE', { weekday: 'long' })}</p>
          <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 px-1">
        {quickStats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Actions - Organized Layout */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Hauptnavigation</h2>
        <div className="grid grid-cols-1 gap-3 px-1">
          {primaryActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className={`${action.color} text-white p-3 rounded-2xl shadow-lg`}>
                  <action.icon size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-slate-900 text-base leading-tight">{action.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{action.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Live System Status */}
      <div className="mx-1">
        <div className="bg-slate-900 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <h3 className="text-white font-black text-lg">System-Status</h3>
            <span className="flex items-center bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Live
            </span>
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-3">
                <ShieldCheck size={18} className="text-blue-400" />
                <span className="text-xs font-bold text-white/90">Einsatzbereitschaft Flotte</span>
              </div>
              <span className="text-xs font-black text-blue-400">98%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-3">
                <TrendingUp size={18} className="text-emerald-400" />
                <span className="text-xs font-bold text-white/90">Performance Heute</span>
              </div>
              <span className="text-xs font-black text-emerald-400">Sehr Gut</span>
            </div>

            <button 
              onClick={() => navigate('/complaints')}
              className="w-full mt-2 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm active:scale-95 transition-transform"
            >
              Protokolle einsehen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
