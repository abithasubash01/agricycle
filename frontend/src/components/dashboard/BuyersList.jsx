import { formatCurrency, calculateMatchScoreColor } from '../../utils/formatters';

const BuyersList = ({ buyers, onSelectBuyer, isLoading }) => {
  if (!buyers || buyers.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-semibold text-gray-900">Matching Buyers</h2>
        <p className="text-gray-500 mt-1">Select a buyer to calculate transport costs and net value.</p>
      </div>

      <div className="space-y-4">
        {buyers.map((buyer, index) => (
          <div 
            key={buyer.id} 
            className={`rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{buyer.name}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${calculateMatchScoreColor(buyer.matchScore)}`}>
                    {buyer.matchScore}% Match
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Industry</p>
                    <p className="text-sm font-medium text-gray-900">{buyer.industryType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">{buyer.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Needs</p>
                    <p className="text-sm font-medium text-gray-900">{buyer.requiredResidues.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Offered Price</p>
                    <p className="text-sm font-bold text-primary-600">{formatCurrency(buyer.offeredPricePerQuintal / 100)}/kg</p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                <button
                  onClick={() => onSelectBuyer(buyer)}
                  disabled={isLoading}
                  className="w-full md:w-auto px-6 py-2.5 bg-white border-2 border-primary-600 text-primary-600 font-medium rounded-full hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Opportunity'}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyersList;
