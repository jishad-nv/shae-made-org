import React from 'react';
import { useStore } from '../context/StoreContext';

export const BottomNav: React.FC = () => {
  const { bagCount, navigateTo, activeRoute } = useStore();

  const navItems = [
    { route: '', icon: 'home', label: 'Home' },
    { route: 'catalog', icon: 'palette', label: 'Catalog' },
    { route: 'bag', icon: 'chat_bubble_outline', label: 'Bag' },
    { route: 'custom', icon: 'card_giftcard', label: 'Custom' },
  ];

  return (
    <nav className="mobile-nav-dock">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <button
              key={item.label}
              onClick={() => navigateTo(item.route)}
              className="flex flex-col items-center justify-center py-1 gap-0.5 text-[10.5px] font-semibold transition-all cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {isActive ? (
                  <div className="w-7 h-7 rounded-lg bg-[#59684c] text-white flex items-center justify-center shadow-xs">
                    <span className="material-icon fill text-base">
                      {item.icon === 'chat_bubble_outline' ? 'chat_bubble' : item.icon}
                    </span>
                  </div>
                ) : (
                  <div className="w-7 h-7 flex items-center justify-center text-[#737c6e] hover:text-[#2b352a]">
                    <span className="material-icon text-lg">{item.icon}</span>
                  </div>
                )}
                {item.route === 'bag' && bagCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-[#59684c] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {bagCount}
                  </span>
                )}
              </div>
              <span className={isActive ? 'text-[#2b352a] font-bold' : 'text-[#737c6e]'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
