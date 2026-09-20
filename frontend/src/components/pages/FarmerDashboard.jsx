import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useFarmerStore } from '../../store/farmerStore';
import { useResidueEstimate } from '../../hooks/useResidueEstimate';
import { useBuyerMatch } from '../../hooks/useBuyerMatch';
import { useTransportCost } from '../../hooks/useTransportCost';
import { useOpportunityAnalysis } from '../../hooks/useOpportunityAnalysis';

import ResidueEstimatorForm from '../forms/ResidueEstimatorForm';
import ResidueCard from '../cards/ResidueCard';
import BuyersList from '../dashboard/BuyersList';
import OpportunityCard from '../cards/OpportunityCard';
import LoadingSpinner from '../LoadingSpinner';

const FarmerDashboard = () => {
  const store = useFarmerStore();
  
  const estimateMutation = useResidueEstimate();
  const matchMutation = useBuyerMatch();
  const transportMutation = useTransportCost();
  const opportunityMutation = useOpportunityAnalysis();

  // Reset workflow on mount if needed
  useEffect(() => {
    // Optional: store.clearWorkflow();
  }, []);

  const handleEstimateSubmit = async (data) => {
    store.setCropType(data.cropType);
    store.setFarmerLocation(data.location);
    
    try {
      const result = await estimateMutation.mutateAsync(data);
      store.setResidueEstimate(result);
      toast.success('Residue estimated successfully!');
    } catch (error) {
      toast.error(error.userMessage || 'Failed to calculate estimate');
    }
  };

  const handleFindBuyers = async () => {
    if (!store.residueEstimate) return;
    
    try {
      const result = await matchMutation.mutateAsync({
        residueType: store.residueEstimate.residueType,
        quantity: store.residueEstimate.estimatedQuantity,
        farmerLocation: store.farmerLocation
      });
      
      store.setMatchedBuyers(result.matches);
      store.setCurrentStep('match');
      
      if (result.matches.length > 0) {
        toast.success(`Found ${result.matches.length} matching buyers!`);
      } else {
        toast.info('No direct matches found. Try broadening your criteria.');
      }
    } catch (error) {
      toast.error(error.userMessage || 'Failed to find buyers');
    }
  };

  const handleSelectBuyer = async (buyer) => {
    store.setSelectedBuyer(buyer);
    store.setCurrentStep('analyze');
    
    try {
      // 1. Calculate Transport
      const transportRes = await transportMutation.mutateAsync({
        fromLocation: store.farmerLocation,
        toLocation: buyer.location,
        quantity: store.residueEstimate.estimatedQuantity
      });
      
      store.setTransportResult(transportRes);
      
      // 2. Analyze full opportunity
      const oppRes = await opportunityMutation.mutateAsync({
        buyerId: buyer.id,
        quantity: store.residueEstimate.estimatedQuantity,
        buyerPrice: buyer.offeredPricePerQuintal,
        transportCost: transportRes.estimatedCost,
        handlingCost: 500 // Demo static handling cost
      });
      
      store.setOpportunityResult(oppRes);
      toast.success('Analysis complete!');
      
    } catch (error) {
      toast.error(error.userMessage || 'Failed to analyze opportunity');
      store.setCurrentStep('match'); // go back on error
    }
  };

  const isAnalyzing = transportMutation.isPending || opportunityMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Turn your crop residue into revenue.</p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ 
              width: store.currentStep === 'estimate' ? '0%' : store.currentStep === 'match' ? '50%' : '100%' 
            }}
          ></div>
          
          {['estimate', 'match', 'analyze'].map((step, index) => {
            const stepNames = { estimate: 'Estimate', match: 'Find Buyers', analyze: 'Analyze' };
            const isActive = store.currentStep === step;
            const isPast = ['estimate', 'match', 'analyze'].indexOf(store.currentStep) > index;
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  isActive ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100' : 
                  isPast ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isPast ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-sm font-medium ${isActive ? 'text-primary-700' : isPast ? 'text-gray-700' : 'text-gray-400'}`}>
                  {stepNames[step]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        
        {/* Step 1: Estimation */}
        {store.currentStep === 'estimate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResidueEstimatorForm 
              onSubmit={handleEstimateSubmit} 
              isLoading={estimateMutation.isPending} 
            />
            
            <div>
              {store.residueEstimate ? (
                <ResidueCard 
                  estimate={store.residueEstimate}
                  onProceed={handleFindBuyers}
                  isLoading={matchMutation.isPending}
                />
              ) : (
                <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Awaiting Details</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">
                    Fill out the form to estimate your crop residue and discover its potential value.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Match Buyers */}
        {store.currentStep === 'match' && (
          <div className="space-y-6">
            <button 
              onClick={() => store.setCurrentStep('estimate')}
              className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2"
            >
              ← Back to Estimate
            </button>
            <BuyersList 
              buyers={store.matchedBuyers}
              onSelectBuyer={handleSelectBuyer}
              isLoading={isAnalyzing}
            />
          </div>
        )}

        {/* Step 3: Analyze */}
        {store.currentStep === 'analyze' && (
          <div className="space-y-6">
            <button 
              onClick={() => store.setCurrentStep('match')}
              className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2"
            >
              ← Back to Buyers
            </button>
            
            {isAnalyzing ? (
              <LoadingSpinner message="Calculating logistics and final net value..." />
            ) : (
              <OpportunityCard 
                analysis={store.opportunityResult}
                buyer={store.selectedBuyer}
                onReset={store.clearWorkflow}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FarmerDashboard;
