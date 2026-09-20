import apiClient from './client';

export const fetchBuyers = async () => {
  const response = await apiClient.get('/api/buyers');
  return response.data;
};

export const matchBuyers = async ({ residueType, quantity, quality, farmerLocation }) => {
  const response = await apiClient.post('/api/buyers/match', {
    residueType,
    quantity,
    quality,
    farmerLocation,
  });
  return response.data;
};
