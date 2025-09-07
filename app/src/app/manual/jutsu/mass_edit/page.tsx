"use client";

import React, { useState } from "react";
import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import { useInfinitePagination } from "@/libs/pagination";
import { api } from "@/app/_trpc/client";
import JutsuFiltering, { useFiltering, getFilter } from "@/layout/JutsuFiltering";
import { useUserData } from "@/utils/UserContext";
import { canChangeContent } from "@/utils/permissions";
import { MassEffectEditor } from "@/layout/EditContent";
import { EffectFieldSelector } from "@/layout/EditContent";

export default function JutsuMassEditPage() {
  const { data: userData } = useUserData();
  const state = useFiltering();

  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);
  const {
    data: jutsus,
    isFetching,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = api.jutsu.getAll.useInfiniteQuery(
    { limit: 50, ...getFilter(state) },
    {
      getNextPageParam: (last) => last.nextCursor,
      placeholderData: (p) => p,
    },
  );
  const allJutsus = jutsus?.pages.flatMap((p) => p.data) || [];
  useInfinitePagination({ fetchNextPage, hasNextPage, lastElement });

  const [fields, setFields] = useState<string[]>([]);
  const canEdit = Boolean(userData && canChangeContent(userData.role));

  return (
    <>
      <ContentBox title="Mass Edit" subtitle="Jutsu" defaultBackHref="/manual/jutsu">
        <p>
          These tools are for efficient mass edit of content effects. Use the filter to
          find entries, select the effect fields to edit, then apply changes across many
          entries at once.
        </p>
      </ContentBox>
      <ContentBox
        title="Editor"
        subtitle="Select fields and edit"
        initialBreak
        topRightContent={
          <div className="flex items-center gap-2">
            <JutsuFiltering state={state} />
            <EffectFieldSelector selected={fields} setSelected={setFields} />
          </div>
        }
        padding={false}
      >
        {!canEdit && <div className="p-3">Not allowed.</div>}
        {canEdit && isFetching && <Loader explanation="Loading data" />}
        {canEdit && (
          <div ref={setLastElement}>
            <MassEffectEditor
              kind="jutsu"
              entries={allJutsus}
              selectedFields={fields}
              onEntriesUpdated={() => void refetch()}
              filterEffectTypes={state.effect}
            />
          </div>
        )}
      </ContentBox>
    </>
  );
}
