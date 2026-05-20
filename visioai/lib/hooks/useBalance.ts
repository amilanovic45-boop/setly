import { useQuery } from '@tanstack/react-query';
import { checkBalance } from '../api/higgsfield';
import { useAppStore } from '../store';

export function useBalance() {
  const { setBalance } = useAppStore();

  return useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const balance = await checkBalance();
      setBalance(balance);
      return balance;
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: 2,
  });
}
