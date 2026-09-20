import { useMutation } from '@tanstack/react-query';
import { matchBuyers } from '../api/buyers';

export const useBuyerMatch = () => {
  return useMutation({
    mutationFn: matchBuyers,
  });
};
