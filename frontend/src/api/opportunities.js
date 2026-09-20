import apiClient from './client';

export const analyzeOpportunity = async ({ buyerId, quantity, buyerPrice, transportCost, handlingCost }) => {
  const response = await apiClient.post('/api/opportunities/analyze', {
    buyerId,
    quantity,
    buyerPrice,
    transportCost,
    handlingCost,
  });
  return response.data;
};
