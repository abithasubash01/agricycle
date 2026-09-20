import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navigation from './components/Navigation';
import HomePage from './components/pages/HomePage';
import FarmerDashboard from './components/pages/FarmerDashboard';

import BuyerDashboard from './components/pages/BuyerDashboard';

const ImpactPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in-up">
    <div className="w-20 h-20 bg-earth-100 rounded-full flex items-center justify-center mb-6">
      <span className="text-4xl">🌍</span>
    </div>
    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Environmental Impact</h1>
    <p className="text-gray-600 max-w-md">
      Track how AgriCycle is reducing CO2 emissions and preventing crop burning across the country.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f8faf9] flex flex-col">
        <Navigation />
        
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/farmer/*" element={<FarmerDashboard />} />
            <Route path="/buyer/*" element={<BuyerDashboard />} />
            <Route path="/impact" element={<ImpactPage />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex justify-center md:justify-start mb-4 md:mb-0">
                <span className="text-xl font-heading font-bold text-gray-400">AgriCycle</span>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">
                  Demo application for hackathon. Not for real transactions.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <ToastContainer 
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
