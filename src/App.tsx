import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { BagView } from './views/BagView';
import { CustomOrderView } from './views/CustomOrderView';
import { AdminView } from './views/AdminView';
import { Toast } from './components/Toast';
import { Lightbox } from './components/Lightbox';
import { CustomerOrderModal } from './components/CustomerOrderModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

const AppContent: React.FC = () => {
  const { activeRoute, routeParam } = useStore();

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
      case 'admin':
        return <AdminView activeTab={routeParam} />;
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
