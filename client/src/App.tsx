import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Home from '@/pages/Home';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
