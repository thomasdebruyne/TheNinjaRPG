"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { api } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContentImage from "@/layout/ContentImage";
import ItemWithEffects, { type GenericObject } from "@/layout/ItemWithEffects";
import Loader from "@/layout/Loader";
import { availableUserActions } from "@/libs/combat/actions";
import type { ActionEffect, ReturnedBattle } from "@/libs/combat/types";
import { cn } from "src/libs/shadui";
import type { Item, BattleAction } from "@/drizzle/schema";

type CombatTimelineProps = {
  battleId: string;
  battle?: ReturnedBattle | null;
  battleVersion?: number;
  pageSize?: number;
  showBasicActions?: boolean;
};

const effectColors: Record<ActionEffect["color"], string> = {
  red: "bg-red-100 text-red-500",
  green: "bg-green-100 text-green-500",
  blue: "bg-blue-100 text-blue-500",
  yellow: "bg-yellow-100 text-yellow-500",
  purple: "bg-purple-100 text-purple-500",
  orange: "bg-orange-100 text-orange-500",
  pink: "bg-pink-100 text-pink-500",
  gray: "bg-gray-100 text-gray-500",
};

const placeholderObj: GenericObject = {
  id: "unknown",
  name: "Unknown action",
  description: "No details available for this action.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CombatTimeline: React.FC<CombatTimelineProps> = ({
  battleId,
  battle,
  battleVersion,
  pageSize = 6,
  showBasicActions = true,
}) => {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<BattleAction | null>(null);

  const { data: entries, isFetching } = api.combat.getBattleEntries.useQuery(
    {
      battleId,
      limit: pageSize,
      offset: page * pageSize,
      refreshKey: battleVersion ?? 0,
    },
    { enabled: !!battleId },
  );

  const resolvedEntries = useMemo(() => {
    if (!entries) return [];
    return entries
      .map((entry) => {
        const user = battle?.usersState.find((u) => u.userId === entry.userId);

        // Call availableUserActions once per entry
        const actions =
          battle && entry.userId
            ? availableUserActions(battle, entry.userId, true, false)
            : [];
        const action = actions.find((a) => a.id === entry.actionId);

        let actionImage: string | undefined;
        let actionItem: GenericObject;
        let actionName: string;

        // Try to resolve by user inventory (jutsu/item)
        const jutsu = user?.jutsus?.find((j) => j.jutsu.id === entry.actionId)?.jutsu;
        const userItem = user?.items?.find((i) => i.item.id === entry.actionId);
        const item = userItem?.item;

        if (jutsu) {
          actionImage = jutsu.image;
          actionItem = jutsu;
          actionName = jutsu.name;
        } else if (userItem && item) {
          actionImage = item.image;
          actionItem = item;
          actionName = item.name;
        } else {
          // Fallback: use action for name/description/etc
          actionImage = action?.image ?? user?.avatar ?? undefined;
          actionItem =
            action?.data ??
            (action
              ? {
                  ...placeholderObj,
                  id: action.id,
                  name: action.name,
                  description: action.battleDescription ?? "",
                  image: action.image,
                  effects: action.effects,
                }
              : placeholderObj);
          actionName = action?.name ?? "Unknown";
        }

        return { entry, user, action, actionItem, actionImage, actionName };
      })
      .filter((resolved) => showBasicActions || resolved.action?.type !== "basic");
  }, [entries, battle, showBasicActions]);

  const canPrev = page > 0;
  const canNext = (entries?.length ?? 0) === pageSize;

  return (
    <div className="relative space-y-3 rounded-lg border bg-slate-100 p-3">
      {isFetching && <Loader explanation="Loading timeline" />}

      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-gray-700" />
        <Clock className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-semibold text-gray-800">Action Timeline</span>
      </div>

      <div className="relative pb-4 overflow-x-auto">
        <div className="relative flex items-center gap-2 px-3 min-w-max">
          <div className="pointer-events-none absolute inset-x-12 top-1/2 h-px -translate-y-1/2 bg-gray-400" />

          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 rounded-full border bg-slate-200 hover:bg-slate-300 shadow-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Show newer actions"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </Button>

          {resolvedEntries.length === 0 && (
            <p className="relative z-10 flex-1 text-center text-xs text-gray-600 mt-6">
              No actions recorded yet.
            </p>
          )}

          {resolvedEntries.map(({ entry, user, actionImage }, index) => (
            <React.Fragment key={entry.id}>
              {index > 0 && (
                <div className="relative w-4 flex-none">
                  <ChevronLeft className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/70" />
                </div>
              )}
              <button
                className={cn(
                  "group relative flex w-20 flex-none flex-col items-center rounded-lg px-1 py-1 text-xs transition",
                  "hover:bg-slate-200",
                )}
                onClick={() => setSelected(entry)}
                aria-label="View action details"
              >
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="rounded-full border bg-slate-50 shadow-sm group-hover:border-gray-400">
                      {actionImage ? (
                        <ContentImage
                          image={actionImage}
                          alt="Action"
                          className="h-16 w-16 rounded-full"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-muted" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-slate-50 shadow-sm group-hover:border-gray-400">
                      {user?.avatar ? (
                        <ContentImage
                          image={user.avatar}
                          alt={user.username}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-[10px] font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      <span>Round {entry.battleRound}</span>
                    </span>
                  </div>
                </div>
              </button>
            </React.Fragment>
          ))}

          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 rounded-full border bg-slate-200 hover:bg-slate-300 shadow-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext}
            aria-label="Show older actions"
          >
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </Button>
        </div>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-col gap-1">
                  <span>Action details</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Round {selected.battleRound}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {selected.description}
                  </span>
                </DialogTitle>
              </DialogHeader>
              {(() => {
                const resolved = resolvedEntries.find(
                  (r) => r.entry.id === selected.id,
                );
                const actionItem = resolved?.actionItem ?? placeholderObj;
                const effects = (selected.appliedEffects ?? []) as ActionEffect[];
                return (
                  <div className="space-y-4">
                    <ItemWithEffects item={actionItem} hideDetails={false} />
                    {effects.length ? (
                      <div className="space-y-2 rounded-md border p-3">
                        <p className="text-sm font-semibold">Applied effects</p>
                        <div className="flex flex-wrap gap-2">
                          {effects.map((effect, idx) => (
                            <span
                              key={`${effect.txt}-${idx}`}
                              className={cn(
                                "rounded-full px-2 py-1 text-[11px] font-medium",
                                effectColors[effect.color],
                              )}
                            >
                              {effect.txt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CombatTimeline;
