import { useMutation } from '@tanstack/react-query';
import { calculateTransport } from '../api/transport';

export const useTransportCost = () => {
  return useMutation({
    mutationFn: calculateTransport,
  });
};
