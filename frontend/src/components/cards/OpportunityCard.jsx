import { formatCurrency, formatDistance, formatNumber } from '../../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const OpportunityCard = ({ analysis, buyer, onReset }) => {
  if (!analysis) return null;

  const chartData = [
    {
      name: 'Gross Value',
      amount: analysis.grossValue,
      fill: '#10b981', // primary-500
    },
    {
      name: 'Transport Cost',
      amount: analysis.totalCosts, // Using total costs to represent deduction
      fill: '#ef4444', // red-500
    },
    {
      name: 'Net Profit',
      amount: analysis.netValue,
      fill: '#059669', // primary-600
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-primary-200 p-6 md:p-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-gray-900">Opportunity Analysis</h2>
          <p className="text-gray-500 mt-1">Detailed breakdown for selling to {buyer?.name}</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Start New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Breakdown */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Financial Breakdown</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gross Value ({formatNumber(analysis.quantity)} kg @ {formatCurrency(buyer?.offeredPricePerQuintal / 100)}/kg)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(analysis.grossValue)}</span>
              </div>
              
              <div className="flex justify-between items-center text-red-600">
                <span>Transport Cost ({formatDistance(analysis.transportDistance)})</span>
                <span>-{formatCurrency(analysis.transportCost)}</span>
              </div>
              
              <div className="flex justify-between items-center text-red-600">
                <span>Handling & Admin</span>
                <span>-{formatCurrency(analysis.handlingCost)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Estimated Net Profit</span>
                <span className="text-2xl font-bold text-primary-600">{formatCurrency(analysis.netValue)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-500 transition-colors shadow-sm">
              Contact Buyer
            </button>
            <button className="flex-1 bg-white text-primary-600 border border-primary-200 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
              Save Opportunity
            </button>
          </div>
        </div>

        {/* Chart */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Value Visualization</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">Visual representation of gross vs net value.</p>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
