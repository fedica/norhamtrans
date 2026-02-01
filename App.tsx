
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Truck
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
import VehiclesView from './views/VehiclesView';
import ComplaintsView from './views/Complaints';
import ControlView from './views/Control';

// Auth Types
interface UserProfile {
  email: string;
  name: string;
  initials: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Language Context
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const TabBar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  // New order: Tourenplan, Tagesprotokoll, Dashboard, Fahrerverwaltung, Fahrzeugflotte
  const tabs = [
    { name: t.tourManager, path: '/tours', icon: MapIcon },
    { name: t.stopPlan, path: '/stops', icon: Calendar },
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard, isMain: true },
    { name: t.driverManager, path: '/drivers', icon: Users },
    { name: t.vehicles, path: '/vehicles', icon: Truck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[84px] bg-white/80 ios-blur border-t border-slate-200 z-50 flex justify-around items-start px-2 pt-2 pb-[safe-area-inset-bottom]">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        if (tab.isMain) {
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center w-full -mt-4 relative transition-all active:scale-95"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isActive ? 'bg-[#007AFF] text-white' : 'bg-slate-900 text-slate-300'}`}>
                <tab.icon size={28} strokeWidth={2.5} />
              </div>
              <span className={`text-[10px] font-black mt-1.5 uppercase tracking-tighter ${isActive ? 'text-[#007AFF]' : 'text-slate-400'}`}>
                {tab.name}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center w-full transition-colors ${isActive ? 'text-[#007AFF]' : 'text-slate-400'}`}
          >
            <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
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
        <Link to="/control" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><ShieldCheck size={20} /></div>
            <span className="font-semibold text-slate-800">{t.control}</span>
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
        <Link to="/complaints" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-1.5 rounded-lg text-white"><AlertCircle size={20} /></div>
            <span className="font-semibold text-slate-800">{t.complaints}</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </Link>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col pb-[100px]">
      <header className="sticky top-0 z-[60] bg-white/90 ios-blur px-6 pt-safe flex items-end justify-between border-b border-slate-100 h-[calc(var(--sat)+56px)] pb-3">
        <span className="text-lg font-bold text-slate-900 leading-tight tracking-tight lowercase">
          norhamtrans <span className="text-[#007AFF] uppercase font-black text-xs">pro</span>
        </span>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#007AFF] font-black text-[10px] border border-blue-200 uppercase active:scale-95 transition-transform"
          >
            {user?.initials || '??'}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Eingeloggt als</p>
                <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={logout}
                  className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
                >
                  <LogOut size={18} />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-x-hidden">
        {children}
      </main>

      <TabBar />
    </div>
  );
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nt_auth') === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userEmail: string, pass: string) => {
    const emailInput = userEmail.toLowerCase().trim();
    const passInput = pass.trim();
    
    // Only t.turcan@anviktrans.de allowed
    if (emailInput === 't.turcan@anviktrans.de' && passInput === '@dmin_') {
      const profile = {
        email: emailInput,
        name: 'Tudor Turcan',
        initials: 'TT'
      };
      setIsAuthenticated(true);
      setUser(profile);
      localStorage.setItem('nt_auth', 'true');
      localStorage.setItem('nt_user', JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('nt_auth');
    localStorage.removeItem('nt_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
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
    <AuthProvider>
      <LanguageProvider>
        <DataProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/drivers" element={<ProtectedRoute><DriverManager /></ProtectedRoute>} />
                <Route path="/tours" element={<ProtectedRoute><TourManager /></ProtectedRoute>} />
                <Route path="/stops" element={<ProtectedRoute><StopPlanView /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><InventoryView /></ProtectedRoute>} />
                <Route path="/vehicles" element={<ProtectedRoute><VehiclesView /></ProtectedRoute>} />
                <Route path="/complaints" element={<ProtectedRoute><ComplaintsView /></ProtectedRoute>} />
                <Route path="/control" element={<ProtectedRoute><ControlView /></ProtectedRoute>} />
                <Route path="/more" element={<ProtectedRoute><MoreView /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </HashRouter>
        </DataProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
