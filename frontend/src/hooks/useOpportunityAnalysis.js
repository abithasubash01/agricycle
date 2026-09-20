import { useMutation } from '@tanstack/react-query';
import { analyzeOpportunity } from '../api/opportunities';

export const useOpportunityAnalysis = () => {
  return useMutation({
    mutationFn: analyzeOpportunity,
  });
};
