import { useMutation } from '@tanstack/react-query';
import { calculateResidue } from '../api/residue';

export const useResidueEstimate = () => {
  return useMutation({
    mutationFn: calculateResidue,
  });
};
