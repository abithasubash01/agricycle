import apiClient from './client';

export const calculateResidue = async ({ cropType, cultivatedArea, estimatedHarvestQuantity }) => {
  const response = await apiClient.post('/api/residue/calculate', {
    crop: cropType.toLowerCase(),
    harvestQuantityKg: estimatedHarvestQuantity,
  });
  return response.data;
};
