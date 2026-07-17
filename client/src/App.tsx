import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routers } from "./routers/routers";

function App() {
  return (
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
  );
}

export default App;
