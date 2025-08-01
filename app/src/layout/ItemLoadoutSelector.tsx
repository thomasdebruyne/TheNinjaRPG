import React from "react";
import Loader from "@/layout/Loader";
import { api } from "@/app/_trpc/client";
import { fedItemLoadouts } from "@/utils/paypal";
import { Folder } from "lucide-react";
import { showMutationToast } from "@/libs/toast";
import { useRequiredUserData } from "@/utils/UserContext";

interface ItemLoadoutSelectorProps {
  size?: "small" | "large";
}

const ItemLoadoutSelector: React.FC<ItemLoadoutSelectorProps> = (props) => {
  // State
  const { data: userData } = useRequiredUserData();

  // tRPC utility
  const utils = api.useUtils();

  // How many loadouts?
  const maxLoadouts = fedItemLoadouts(userData);
  console.log(maxLoadouts);

  // Get loadouts
  const { data, isFetching } = api.item.getItemLoadouts.useQuery(undefined, {
    enabled: maxLoadouts > 1,
  });

  // Mutations
  const { mutate: selectItemLoadout, isPending } =
    api.item.selectItemLoadout.useMutation({
      onSuccess: async (data) => {
        showMutationToast(data);
        if (data.success) {
          await utils.profile.getUser.invalidate();
          await utils.item.getUserItems.invalidate();
        }
      },
    });

  // Derived size vars
  const iconSize = props?.size === "small" ? "h-6 w-6" : "h-10 w-10";
  const textSize = props?.size === "small" ? "text-xs" : "text-sm mt-1";

  // Loaders
  if (!userData) return <Loader />;
  if (isFetching) return <Loader />;
  if (isPending) return <Loader />;

  if (maxLoadouts <= 0) return null;

  // Show loadout selectors
  return (
    <div className="flex flex-row gap-1">
      {data?.map((loadout, i) => {
        return (
          <div className="relative" key={i}>
            <Folder
              className={`${iconSize} ${userData.itemLoadout === loadout.id ? "fill-orange-300" : "hover:cursor-pointer hover:fill-orange-300"}`}
              onClick={() => selectItemLoadout({ id: loadout.id })}
            />
            <div
              className={`absolute font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:cursor-pointer ${textSize}`}
              onClick={() => selectItemLoadout({ id: loadout.id })}
            >
              {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemLoadoutSelector;
