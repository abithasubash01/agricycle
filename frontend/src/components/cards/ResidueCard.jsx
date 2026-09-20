import { formatNumber } from '../../utils/formatters';

const ResidueCard = ({ estimate, onProceed, isLoading }) => {
  if (!estimate) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-heading font-semibold text-gray-900">Estimation Complete</h3>
          <p className="text-gray-500 text-sm mt-1">Based on our agricultural model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Residue Type</p>
          <p className="text-2xl font-bold text-gray-900">{estimate.residueType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Estimated Quantity</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-primary-600">{formatNumber(estimate.estimatedQuantity)}</p>
            <p className="text-gray-600 font-medium">kg</p>
          </div>
        </div>
      </div>

      <div className="bg-earth-50 rounded-xl p-4 mb-8">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-earth-600 mt-0.5">💡</div>
          <p className="text-sm text-earth-800">
            Burning this amount of residue would generate approximately <strong>{formatNumber(estimate.environmentalImpact.co2EmissionsAvoided)}kg of CO2</strong>. Selling it creates value and protects the environment.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onProceed}
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-500 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isLoading ? 'Finding Buyers...' : 'Find Matching Buyers'}
          {!isLoading && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResidueCard;
