import { api } from "@/app/_trpc/client";
import { showMutationToast } from "@/libs/toast";
import { useUserData } from "@/utils/UserContext";

/**
 * Hook for toggling sleep status.
 * Can be used across multiple pages (home, battle arena, etc.)
 */
export const useSleepToggle = () => {
  const { updateUser } = useUserData();

  const { mutate: toggleSleep, isPending: isTogglingSleep } =
    api.home.toggleSleep.useMutation({
      onSuccess: async (data) => {
        if (data.success && data.newStatus) {
          await updateUser({ status: data.newStatus });
        } else {
          showMutationToast(data);
        }
      },
    });

  return {
    toggleSleep,
    isTogglingSleep,
  };
};
