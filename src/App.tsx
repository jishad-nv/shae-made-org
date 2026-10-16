import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { BagView } from './views/BagView';
import { CustomOrderView } from './views/CustomOrderView';
import { OrderTrackerView } from './views/OrderTrackerView';
import { RefPhotosView } from './views/RefPhotosView';
import { AdminView } from './views/AdminView';
import { AdminLogin } from './views/AdminLogin';
import { Toast } from './components/Toast';
import { Lightbox } from './components/Lightbox';
import { CustomerOrderModal } from './components/CustomerOrderModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { StoreLoadingSkeleton } from './components/StoreLoadingSkeleton';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent: React.FC = () => {
  const { activeRoute, routeParam, isLoading, loadError, retryLoading } = useStore();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const renderCurrentView = () => {
    switch (activeRoute) {
      case 'catalog':
        return <CatalogView />;
      case 'p':
        return <ProductDetailView productId={routeParam} />;
      case 'bag':
        return <BagView />;
      case 'custom':
        return <CustomOrderView />;
      case 'tracker':
        return <OrderTrackerView />;
      case 'ref':
        return <RefPhotosView orderId={routeParam} />;
      case 'admin':
        if (isAuthenticated === null) return <div className="min-h-screen flex items-center justify-center bg-[#fcf9f4]">Loading...</div>;
        return isAuthenticated ? <AdminView activeTab={routeParam} /> : <AdminLogin />;
      case '':
      default:
        return <HomeView />;
    }
  };

  return (
    <div className={`min-h-screen text-[#2b352a] ${activeRoute === 'admin' ? 'admin-mode' : ''}`}>
      {/* Friendly cloud connection error with retry */}
      {loadError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between gap-2 z-50 sticky top-0">
          <div className="flex items-center gap-1.5">
            <span className="material-icon text-sm">wifi_off</span>
            <span>{loadError}</span>
          </div>
          <button
            onClick={() => retryLoading()}
            className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 font-bold transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {isLoading && activeRoute !== 'admin' ? (
        <StoreLoadingSkeleton />
      ) : (
        renderCurrentView()
      )}

      <CustomerOrderModal />
      <Toast />
      <Lightbox />
      {activeRoute !== 'admin' && <FloatingWhatsApp />}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
