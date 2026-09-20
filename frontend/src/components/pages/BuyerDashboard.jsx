import { useState, useEffect } from 'react';
import { formatCurrency, formatDistance, formatNumber } from '../../utils/formatters';

const BuyerDashboard = () => {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    // For the hackathon, we simulate fetching the available residue from the backend or display a static one
    setOpportunities([
      {
        id: 1,
        residueType: 'Rice Straw',
        quantity: 3500,
        location: 'Cuddalore',
        distance: 150,
        pricePerKg: 3,
        industry: 'Biomass Fuel'
      }
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Available Agricultural Residue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full animate-fade-in-up">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">{opp.residueType}</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">{formatNumber(opp.quantity)} kg</p>
            </div>
            
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Location</span>
                <span className="font-medium text-gray-900">{opp.location}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Distance</span>
                <span className="font-medium text-gray-900">{formatDistance(opp.distance)} away</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Price</span>
                <span className="font-medium text-gray-900">{formatCurrency(opp.pricePerKg)}/kg</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Best For</span>
                <span className="font-medium text-gray-900">{opp.industry}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">
              View Opportunity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerDashboard;
