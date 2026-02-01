
import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  LogOut,
  Map as MapIcon,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

import { translations } from './translations';
import { Driver, InventoryItem, StopPlan, Complaint, ControlChecklist, Tour } from './types';
import { initialDrivers, initialInventory, initialStops, initialComplaints } from './services/mockData';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import DriverManager from './views/DriverManager';
import StopPlanView from './views/StopPlan';
import TourManager from './views/TourManager';
import InventoryView from './views/Inventory';
import ComplaintsView from './views/Complaints';
import ControlView from './views/Control';

// Language Context - Hardcoded to German
interface LanguageContextType {
  lang: 'de';
  t: typeof translations.de;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
};

// Data Context
interface DataContextType {
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  stops: StopPlan[];
  setStops: React.Dispatch<React.SetStateAction<StopPlan[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  controls: ControlChecklist[];
  setControls: React.Dispatch<React.SetStateAction<ControlChecklist[]>>;
  tours: Tour[];
  setTours: React.Dispatch<React.SetStateAction<Tour[]>>;
}
const DataContext = createContext<DataContextType | undefined>(undefined);
export const useAppData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAppData must be used within DataProvider");
  return context;
};

const TabBar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const tabs = [
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { name: t.tourManager, path: '/tours', icon: MapIcon },
    { name: t.driverManager, path: '/drivers', icon: Users },
    { name: 'Check', path: '/control', icon: ShieldCheck },
    { name: 'Mehr', path: '/more', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[84px] bg-white/80 ios-blur border-t border-slate-200 z-50 flex justify-around items-start px-2 pt-2 pb-[safe-area-inset-bottom]">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center w-full transition-colors ${isActive ? 'text-[#007AFF]' : 'text-slate-400'}`}
          >
            <tab.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-semibold mt-1">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const MoreView = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 pt-4 animate-in slide-in-from-right-4 duration-300">
      <h1 className="text-3xl font-extrabold px-4 mb-6">Menü</h1>
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 mx-4">
        <Link to="/complaints" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-1.5 rounded-lg text-white"><AlertCircle size={20} /></div>
            <span className="font-semibold text-slate-800">{t.complaints}</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </Link>
        <Link to="/inventory" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white"><Package size={20} /></div>
            <span className="font-semibold text-slate-800">{t.inventory}</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </Link>
        <Link to="/stops" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-1.5 rounded-lg text-white"><Calendar size={20} /></div>
            <span className="font-semibold text-slate-800">{t.stopPlan}</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </Link>
      </div>

      <div className="px-4 pt-4">
        <button 
          onClick={() => window.location.href = '#/'}
          className="w-full bg-white text-red-500 font-bold py-4 rounded-xl shadow-sm border border-slate-200 active:bg-slate-100 transition-colors"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col pb-[100px] pt-[safe-area-inset-top]">
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 h-14 flex items-center justify-between border-b border-slate-100">
        <span className="text-lg font-bold text-slate-900">norhamtrans <span className="text-[#007AFF]">pro</span></span>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#007AFF] font-bold text-xs border border-blue-200">
          nt
        </div>
      </header>
      
      <main className="flex-1 p-4">
        {children}
      </main>

      <TabBar />
    </div>
  );
};

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageContext.Provider value={{ lang: 'de', t: translations.de }}>
      {children}
    </LanguageContext.Provider>
  );
};

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [stops, setStops] = useState<StopPlan[]>(initialStops);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [controls, setControls] = useState<ControlChecklist[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);

  return (
    <DataContext.Provider value={{ 
      drivers, setDrivers, 
      inventory, setInventory, 
      stops, setStops, 
      complaints, setComplaints, 
      controls, setControls,
      tours, setTours
    }}>
      {children}
    </DataContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <DataProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/drivers" element={<DriverManager />} />
              <Route path="/tours" element={<TourManager />} />
              <Route path="/stops" element={<StopPlanView />} />
              <Route path="/inventory" element={<InventoryView />} />
              <Route path="/complaints" element={<ComplaintsView />} />
              <Route path="/control" element={<ControlView />} />
              <Route path="/more" element={<MoreView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </DataProvider>
    </LanguageProvider>
  );
};

export default App;
