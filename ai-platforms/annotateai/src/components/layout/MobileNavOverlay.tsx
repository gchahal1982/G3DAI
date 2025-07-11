'use client';

import Navigation from './Navigation';

export default function MobileNavOverlay() {
  const handleOverlayClick = () => {
    const overlay = document.getElementById('mobile-nav-overlay');
    if (overlay) overlay.classList.add('hidden');
  };

  return (
    <div 
      id="mobile-nav-overlay" 
      className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm hidden"
      onClick={handleOverlayClick}
    >
      <div className="w-80 h-full">
        <Navigation />
      </div>
    </div>
  );
} 