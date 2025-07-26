import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { useApiKeys } from "../ApiKeyProvider";

export const useLimits = () => {
  const { user } = useUser();
  const { assemblyAiKey } = useApiKeys();

  const isBYOK = !!assemblyAiKey;

  const transformationsQuery = trpc.limit.getTransformationsLeft.useQuery(
    undefined,
    { enabled: !!user && !isBYOK } // Don't fetch if BYOK (unlimited)
  );

  const minutesQuery = trpc.limit.getMinutesLeft.useQuery(
    undefined,
    { enabled: !!user && !isBYOK } // Don't fetch if BYOK (unlimited)
  );

  return {
    transformationsData: transformationsQuery.data,
    isLoading: transformationsQuery.isLoading || minutesQuery.isLoading,
    minutesData: minutesQuery.data,
  };
};
