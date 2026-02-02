
import React, { useState, createContext, useContext, useEffect, PropsWithChildren, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  Map as MapIcon,
  ChevronRight,
  Truck,
  LogOut,
  User as UserIcon,
  Settings,
  Mail,
  Shield
} from 'lucide-react';

import { translations } from './translations';
import { Driver, InventoryItem, StopPlan, Complaint, ControlChecklist, Tour } from './types';
import { initialDrivers, initialInventory, initialStops, initialComplaints } from './services/mockData';
import Dashboard from './views/Dashboard';
import DriverManager from './views/DriverManager';
import StopPlanView from './views/StopPlan';
import TourManager from './views/TourManager';
import InventoryView from './views/Inventory';
import VehiclesView from './views/VehiclesView';
import ComplaintsView from './views/Complaints';
import ControlView from './views/Control';
import Login from './views/Login';

// Language Context
interface LanguageContextType {
  lang: 'de' | 'ro';
  t: typeof translations.de;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
};

// Auth Context
interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
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
  refreshData: () => Promise<void>;
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

const Layout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-[100px]">
      <header className="sticky top-0 z-[60] bg-white/90 ios-blur px-6 pt-safe flex items-center justify-between border-b border-slate-100 h-[calc(var(--sat)+56px)]">
        <div className="flex flex-col justify-center">
          <span className="text-lg font-bold text-slate-900 leading-tight tracking-tight lowercase">
            norhamtrans <span className="text-[#007AFF] uppercase font-black text-xs">{t.cockpit}</span>
          </span>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
          >
            {user ? (
              <span className="text-xs font-black text-[#007AFF]">{user.firstName[0]}{user.lastName[0]}</span>
            ) : (
              <UserIcon size={18} className="text-slate-400" />
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                <p className="text-sm font-black text-slate-900 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center"><Mail size={10} className="mr-1" /> {user?.email}</p>
                <p className="text-[9px] font-black text-[#007AFF] uppercase tracking-widest mt-2 bg-blue-50 px-2 py-0.5 rounded-full inline-block border border-blue-100">
                  <Shield size={8} className="inline mr-1 -mt-0.5" /> {user?.role}
                </p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#007AFF] group-hover:scale-110 transition-transform">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{t.editProfile}</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                    <Settings size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{t.settings}</span>
                </button>
              </div>
              <div className="p-2 border-t border-slate-100">
                <button 
                  onClick={() => { setIsProfileMenuOpen(false); logout(); }}
                  className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-red-50 rounded-2xl transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <LogOut size={16} />
                  </div>
                  <span className="text-xs font-black text-red-500 uppercase tracking-widest">{t.logout}</span>
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

const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <LanguageContext.Provider value={{ lang: 'de', t: translations.de }}>
      {children}
    </LanguageContext.Provider>
  );
};

const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('norham_auth') === 'true';
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('norham_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, pass: string) => {
    if (email && pass) {
      const mockUser: AuthUser = {
        firstName: 'Admin',
        lastName: 'Manager',
        email: email,
        role: 'Administrator'
      };
      setIsAuthenticated(true);
      setUser(mockUser);
      localStorage.setItem('norham_auth', 'true');
      localStorage.setItem('norham_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('norham_auth');
    localStorage.removeItem('norham_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const DataProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('norham_drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('norham_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });
  const [stops, setStops] = useState<StopPlan[]>(() => {
    const saved = localStorage.getItem('norham_stops');
    return saved ? JSON.parse(saved) : initialStops;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('norham_complaints');
    return saved ? JSON.parse(saved) : initialComplaints;
  });
  const [controls, setControls] = useState<ControlChecklist[]>(() => {
    const saved = localStorage.getItem('norham_controls');
    return saved ? JSON.parse(saved) : [];
  });
  const [tours, setTours] = useState<Tour[]>(() => {
    const saved = localStorage.getItem('norham_tours');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('norham_drivers', JSON.stringify(drivers)); }, [drivers]);
  useEffect(() => { localStorage.setItem('norham_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('norham_stops', JSON.stringify(stops)); }, [stops]);
  useEffect(() => { localStorage.setItem('norham_complaints', JSON.stringify(complaints)); }, [complaints]);
  useEffect(() => { localStorage.setItem('norham_controls', JSON.stringify(controls)); }, [controls]);
  useEffect(() => { localStorage.setItem('norham_tours', JSON.stringify(tours)); }, [tours]);

  const refreshData = async () => {
    console.log('Local data is up to date.');
  };

  return (
    <DataContext.Provider value={{ 
      drivers, setDrivers, 
      inventory, setInventory, 
      stops, setStops, 
      complaints, setComplaints, 
      controls, setControls,
      tours, setTours,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drivers" element={<DriverManager />} />
          <Route path="/tours" element={<TourManager />} />
          <Route path="/stops" element={<StopPlanView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/vehicles" element={<VehiclesView />} />
          <Route path="/complaints" element={<ComplaintsView />} />
          <Route path="/control" element={<ControlView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
