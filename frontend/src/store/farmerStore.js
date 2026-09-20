import { create } from 'zustand';

export const useFarmerStore = create((set) => ({
  // Current workflow step: 'estimate' | 'match' | 'analyze'
  currentStep: 'estimate',
  setCurrentStep: (step) => set({ currentStep: step }),

  // Farmer input
  cropType: '',
  setCropType: (crop) => set({ cropType: crop }),

  farmerLocation: '',
  setFarmerLocation: (loc) => set({ farmerLocation: loc }),

  // Step 1 result
  residueEstimate: null,
  setResidueEstimate: (estimate) => set({ residueEstimate: estimate }),

  // Step 2 result
  matchedBuyers: null,
  setMatchedBuyers: (buyers) => set({ matchedBuyers: buyers }),

  // Step 3 inputs
  selectedBuyer: null,
  setSelectedBuyer: (buyer) => set({ selectedBuyer: buyer }),

  transportResult: null,
  setTransportResult: (cost) => set({ transportResult: cost }),

  opportunityResult: null,
  setOpportunityResult: (opp) => set({ opportunityResult: opp }),

  // Reset entire workflow
  clearWorkflow: () =>
    set({
      currentStep: 'estimate',
      cropType: '',
      farmerLocation: '',
      residueEstimate: null,
      matchedBuyers: null,
      selectedBuyer: null,
      transportResult: null,
      opportunityResult: null,
    }),
}));
