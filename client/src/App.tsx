import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routers } from "./routers/routers";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { authService } from "@/api/services/authService";
import { ThemeProvider } from "@/components/theme-provider";
function App() {
  const { isAuthenticated, setUser, clearAuth } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      authService.getMe().then((res) => {
        if (res.data) {
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
        <Routes>
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
      </Router>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default App;
