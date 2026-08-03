import { useLocation } from 'react-router-dom';
import { ThemeProvider } from './theme-provider';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminOrPartner = location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner');
  
  return (
    <ThemeProvider 
      defaultTheme="system" 
      storageKey="nest-booking-theme" 
      forcedTheme={isAdminOrPartner ? undefined : "light"}
    >
      {children}
    </ThemeProvider>
  );
}