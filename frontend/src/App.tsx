import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Practice from './pages/Practice';
import Dashboard from './pages/Dashboard';
import TutorChat from './pages/TutorChat';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<TutorChat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
