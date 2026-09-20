import apiClient from './client';

export const calculateTransport = async ({ fromLocation, toLocation, quantity }) => {
  const response = await apiClient.post('/api/transport/calculate', {
    fromLocation,
    toLocation,
    quantity,
  });
  return response.data;
};
