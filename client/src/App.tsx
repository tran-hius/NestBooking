import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routers } from "./routers/routers";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, Suspense } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { authService } from "@/api/services/authService";
import { ThemeProvider } from "@/components/theme-provider";
import PaymentResult from "./pages/PaymentResult";

function App() {
  const { isAuthenticated, setUser, clearAuth } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      authService.getMe().then((res: any) => {
        const userData = res.data?.data || res.data || res;
        if (userData && Object.keys(userData).length > 0 && !userData.status) {
          setUser(userData);
        } else if (res.data) {
          setUser(res.data);
        }
      }).catch(() => {
        clearAuth();
      });
    }
  }, [isAuthenticated, setUser, clearAuth]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="nest-booking-theme">
      <Router>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-white"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div></div>}>
          <Routes>
            <Route path="/payment/result" element={<PaymentResult />} />
            {routers.map((route) => {
              const Layout = route.layout;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    Layout ? <Layout>{route.component}</Layout> : route.component
                  }
                />
              );
            })}
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default App;
