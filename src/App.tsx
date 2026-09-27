import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HotlineBanner } from './components/HotlineBanner';
import { InventorySection } from './components/InventorySection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { LocationSection } from './components/LocationSection';
import { ContactOrderSection } from './components/ContactOrderSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { AdminGuard } from './components/admin/AdminGuard';
import { subscribeToProducts, FirestoreProductItem } from './services/products';
import { Product } from './types/inventory';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [prefilledContactPart] = useState<string>('');
  
  // Realtime subscription to Firestore products collection for the public website
  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (firestoreItems: FirestoreProductItem[]) => {
        const mapped: Product[] = (firestoreItems || []).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category as any,
          image: item.imageUrl,
          description: item.description,
          featured: item.featured,
          inStock: true
        }));
        setProducts(mapped);
      },
      (error) => {
        console.warn('Realtime products listener notice:', error);
        setProducts([]);
      }
    );

    return () => unsubscribe();
  }, []);
  
  // Route state: checks for /admin or #admin
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handleLocationCheck = () => {
      const isCurrentAdmin = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
      setIsAdminRoute(isCurrentAdmin);
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);

    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  const handleNavigateToPublic = () => {
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    window.location.hash = '';
    setIsAdminRoute(false);
  };

  const handleOpenOrderModal = (productName?: string) => {
    setSelectedProduct(productName || '');
    setOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedProduct('');
  };

  const handleViewInventory = () => {
    const el = document.querySelector('#inventory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If visiting /admin, render Protected Admin Area
  if (isAdminRoute) {
    return <AdminGuard onNavigateToPublic={handleNavigateToPublic} />;
  }

  // Public Website Render
  return (
    <div className="min-h-screen bg-[#0F1115] font-['Outfit'] text-gray-200 antialiased flex flex-col selection:bg-[#E64A19] selection:text-white">
      {/* 1. Header Navigation */}
      <Header onOpenOrderModal={handleOpenOrderModal} />

      {/* Main Page Body */}
      <main className="flex-1 w-full">
        {/* 2. Hero Section with Storefront & Slideshow */}
        <Hero
          products={products}
          onOpenOrderModal={handleOpenOrderModal}
          onViewInventory={handleViewInventory}
        />

        {/* 3. Fast Hotline Banner */}
        <HotlineBanner onOpenOrderModal={() => handleOpenOrderModal()} />

        {/* 4. Inventory Catalog Grid */}
        <InventorySection
          products={products}
          onOpenOrderModal={handleOpenOrderModal}
        />

        {/* 5. Automotive Services & Specialties */}
        <ServicesSection />

        {/* 6. About Ankobeng Motors */}
        <AboutSection />

        {/* 7. Physical Location & Interactive Real Map */}
        <LocationSection />

        {/* 8. Direct Contact & Place Order Form */}
        <ContactOrderSection prefilledPart={prefilledContactPart} />
      </main>

      {/* 9. Footer with discreet admin link */}
      <Footer />

      {/* 10. Quick Order / WhatsApp Inquiries Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={handleCloseOrderModal}
        productName={selectedProduct}
      />
    </div>
  );
}
