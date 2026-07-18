import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routers } from "./routers/routers";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
