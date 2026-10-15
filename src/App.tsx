import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { BagView } from './views/BagView';
import { CustomOrderView } from './views/CustomOrderView';
import { OrderTrackerView } from './views/OrderTrackerView';
import { AdminView } from './views/AdminView';
import { AdminLogin } from './views/AdminLogin';
import { Toast } from './components/Toast';
import { Lightbox } from './components/Lightbox';
import { CustomerOrderModal } from './components/CustomerOrderModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent: React.FC = () => {
  const { activeRoute, routeParam } = useStore();
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
      case 'admin':
        if (isAuthenticated === null) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
        return isAuthenticated ? <AdminView activeTab={routeParam} /> : <AdminLogin />;
      case '':
      default:
        return <HomeView />;
    }
  };

  return (
    <div className={`min-h-screen text-[#2b352a] ${activeRoute === 'admin' ? 'admin-mode' : ''}`}>
      {renderCurrentView()}
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
