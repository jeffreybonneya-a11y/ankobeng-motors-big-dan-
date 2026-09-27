import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  UserCheck, 
  Layers, 
  Package, 
  Tag, 
  Sliders, 
  Home, 
  Building2, 
  Image as ImageIcon, 
  Settings, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { AdminRecord } from '../../services/auth';
import { AdminTab } from './AdminSidebar';
import { FIRESTORE_DATABASE_ID, FIREBASE_PROJECT_ID, db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface DashboardOverviewProps {
  adminRecord: AdminRecord;
  adminEmail: string;
  onNavigateTab: (tab: AdminTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  adminRecord,
  adminEmail,
  onNavigateTab
}) => {
  const [realProductsCount, setRealProductsCount] = useState<number | null>(null);
  const [realMediaCount, setRealMediaCount] = useState<number | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    // Read real Firestore products & media count without creating or seeding data
    try {
      const productsCol = collection(db, 'products');
      const mediaCol = collection(db, 'media');

      const unsubProducts = onSnapshot(
        productsCol,
        (snapshot) => {
          setRealProductsCount(snapshot.size);
        },
        () => {
          setRealProductsCount(0);
        }
      );

      const unsubMedia = onSnapshot(
        mediaCol,
        (snapshot) => {
          setRealMediaCount(snapshot.size);
          setLoadingMetrics(false);
        },
        () => {
          setRealMediaCount(0);
          setLoadingMetrics(false);
        }
      );

      return () => {
        unsubProducts();
        unsubMedia();
      };
    } catch {
      setRealProductsCount(0);
      setRealMediaCount(0);
      setLoadingMetrics(false);
    }
  }, []);

  const sectionsList: { id: AdminTab; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'products', title: 'Products', desc: 'Engine inventory and automotive parts', icon: Package },
    { id: 'categories', title: 'Categories', desc: 'Car brands and component categories', icon: Tag },
    { id: 'heroSlides', title: 'Hero Slides', desc: 'Homepage carousel banner slides', icon: Sliders },
    { id: 'homepage', title: 'Homepage', desc: 'Main page content and headline sections', icon: Home },
    { id: 'businessInfo', title: 'Business Info', desc: 'Abossey Okai yard address and contacts', icon: Building2 },
    { id: 'media', title: 'Media Library', desc: 'Engine photographs and brand assets', icon: ImageIcon },
    { id: 'settings', title: 'Settings', desc: 'Dealership configuration and admin access', icon: Settings },
  ];

  return (
    <div className="space-y-6 font-['Outfit'] text-gray-200">
      
      {/* 1. Welcome & Status Card */}
      <div className="p-6 rounded-lg bg-[#161920] border border-[#2B313E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              System Active &amp; Authorized
            </span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">
            Welcome, {adminRecord.displayName || 'Big Dan Admin'}
          </h2>
          <p className="text-xs text-gray-400">
            ANKOBENG MOTORS Dealership Administration Portal • Abossey Okai, Accra, Ghana
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded bg-[#1E222B] border border-[#2B313E] text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Admin Role</span>
            <span className="font-bold text-white uppercase">{adminRecord.role || 'Admin'}</span>
          </div>
          <div className="px-3 py-2 rounded bg-[#1E222B] border border-[#2B313E] text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Account Status</span>
            <span className="font-bold text-emerald-400 uppercase">Active</span>
          </div>
        </div>
      </div>

      {/* 2. Authentication & Real System Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Admin Email */}
        <div className="p-4 rounded-lg bg-[#161920] border border-[#2B313E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Admin Email
            </span>
            <UserCheck className="w-4 h-4 text-[#E64A19]" />
          </div>
          <div className="font-bold text-white text-xs truncate">
            {adminEmail}
          </div>
          <span className="text-[10px] text-gray-400 block">
            Google Admin Auth
          </span>
        </div>

        {/* Card 2: Connected Database */}
        <div className="p-4 rounded-lg bg-[#161920] border border-[#2B313E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Firestore Database
            </span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono text-gray-200 text-[11px] truncate">
            {FIRESTORE_DATABASE_ID}
          </div>
          <span className="text-[10px] text-gray-400 block">
            Project: {FIREBASE_PROJECT_ID}
          </span>
        </div>

        {/* Card 3: Real Products Count */}
        <div className="p-4 rounded-lg bg-[#161920] border border-[#2B313E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Inventory Items
            </span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {loadingMetrics ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              `${realProductsCount} Items`
            )}
          </div>
          <span className="text-[10px] text-gray-400 block">
            Collection: <code className="text-gray-300">/products</code>
          </span>
        </div>

        {/* Card 4: Real Media Assets Count */}
        <div className="p-4 rounded-lg bg-[#161920] border border-[#2B313E] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Cloudinary Media
            </span>
            <ImageIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {loadingMetrics ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              `${realMediaCount} Assets`
            )}
          </div>
          <span className="text-[10px] text-gray-400 block">
            Collection: <code className="text-gray-300">/media</code>
          </span>
        </div>

      </div>

      {/* 3. Dealership Admin Navigation Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E64A19]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              CMS Sections
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Foundation Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectionsList.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onNavigateTab(sec.id)}
                className="p-4 rounded-lg bg-[#161920] hover:bg-[#1A1E26] border border-[#2B313E] hover:border-[#3B4254] transition-colors text-left flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#E64A19] shrink-0" />
                    <span className="font-bold text-white text-xs uppercase group-hover:text-[#E64A19] transition-colors truncate">
                      {sec.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed truncate">
                    {sec.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0 mt-0.5" />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
