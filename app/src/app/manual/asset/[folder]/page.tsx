"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import ItemWithEffects from "@/layout/ItemWithEffects";
import Modal2 from "@/layout/Modal2";
import { api } from "@/app/_trpc/client";
import { ActionSelector } from "@/layout/CombatActions";
import { useInfinitePagination } from "@/libs/pagination";
import { useUserData } from "@/utils/UserContext";
import { showMutationToast } from "@/libs/toast";
import { canChangeContent } from "@/utils/permissions";
import type { GameAsset } from "@/drizzle/schema";

export default function ManualAssetsFolderPage() {
  const params = useParams<{ folder: string }>();
  const folder = decodeURIComponent(params.folder);

  const { data: userData } = useUserData();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [asset, setAsset] = useState<GameAsset | undefined>(undefined);
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);

  const {
    data: assets,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = api.gameAsset.getAll.useInfiniteQuery(
    { limit: 60, folder },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: (previousData) => previousData,
    },
  );
  const allAssets = assets?.pages.map((page) => page.data).flat();
  useInfinitePagination({ fetchNextPage, hasNextPage, lastElement });

  const { mutate: remove } = api.gameAsset.delete.useMutation({
    onSuccess: async (data) => {
      showMutationToast(data);
      await refetch();
    },
  });

  const isPending = isFetching;

  return (
    <ContentBox
      title={`Folder: ${folder}`}
      subtitle="Assets in this folder"
      defaultBackHref="/manual/asset"
    >
      <ActionSelector
        items={allAssets?.map((a) => ({
          ...a,
          type: "asset" as const,
          assetType: a.type,
          url: a.url,
        }))}
        labelSingles={true}
        onClick={(id) => {
          setAsset(allAssets?.find((asset) => asset.id === id));
          setIsOpen(true);
        }}
        showBgColor={false}
        roundFull={true}
        hideBorder={true}
        showLabels={true}
        lastElement={lastElement}
        setLastElement={setLastElement}
        gridClassNameOverwrite="grid grid-cols-3 md:grid-cols-4"
        emptyText="No assets exist in this folder."
      />
      {isPending && <Loader explanation="Loading data" />}
      {isOpen && userData && asset && (
        <Modal2
          title="Asset Details"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isValid={false}
          className="max-w-3xl"
        >
          {!isPending && (
            <div className="relative">
              <ItemWithEffects
                hideImage
                item={asset}
                key={asset.id}
                onDelete={(id: string) => {
                  if (userData && canChangeContent(userData.role)) {
                    remove({ id });
                    setIsOpen(false);
                  }
                }}
                showEdit="asset"
              />
            </div>
          )}
          {isPending && <Loader explanation={`Processing ${asset.name}`} />}
        </Modal2>
      )}
    </ContentBox>
  );
}
