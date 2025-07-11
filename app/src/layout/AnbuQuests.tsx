"use client";

import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import { LogbookEntry } from "@/layout/Logbook";
import { showMutationToast } from "@/libs/toast";
import { api } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import Accordion from "@/layout/Accordion";
import ItemWithEffects from "@/layout/ItemWithEffects";
import { useState, useEffect } from "react";
import { useRequireInVillage } from "@/utils/UserContext";

export default function AnbuQuests() {
  const util = api.useUtils();
  const [activeElement, setActiveElement] = useState<string>("");

  const { userData } = useRequireInVillage("/anbu");

  const { data: anbuQuests } = api.quests.specificQuests.useQuery({
    level: userData?.level ?? 0,
    questType: "anbu",
  });

  const { mutate: startQuest, isPending } = api.quests.startQuest.useMutation({
    onSuccess: async (data) => {
      showMutationToast(data);
      await Promise.all([
        util.profile.getUser.invalidate(),
        util.quests.specificQuests.invalidate(),
      ]);
    },
  });

  // Default active tab
  useEffect(() => {
    if (userData && !activeElement) {
      const currentQuest = userData?.userQuests?.find((uq) =>
        ["anbu"].includes(uq.quest.questType),
      );
      if (currentQuest) {
        setActiveElement(currentQuest.quest.name);
      }
    }
  }, [userData, activeElement]);

  if (!userData) return null;
  if (!userData.anbuId) return null;

  // Filter for anbu quests only
  const availableAnbuQuests = anbuQuests ?? [];

  return (
    <ContentBox
      title="ANBU Missions"
      subtitle="Empower the squad and help the village"
      initialBreak={true}
      padding={false}
    >
      {isPending && <Loader explanation="Starting quest..." />}
      {!isPending && (
        <div className="bg-popover">
          {availableAnbuQuests.length === 0 && (
            <p className="font-bold p-3">No current anbu quests available</p>
          )}
          {availableAnbuQuests.map((quest, i) => {
            const currentQuest = userData?.userQuests?.find(
              (uq) => uq.quest.id === quest.id && !uq.endAt,
            );
            const currentTracker = userData?.questData?.find((q) => q.id === quest.id);
            const active = currentQuest && currentTracker;

            return (
              <div key={i}>
                <Accordion
                  title={quest.name}
                  selectedTitle={activeElement}
                  titlePrefix={`${active ? "Active" : "Available"}: `}
                  onClick={setActiveElement}
                >
                  {active ? (
                    <div className="p-3">
                      <LogbookEntry
                        userQuest={currentQuest}
                        tracker={currentTracker}
                        hideTitle
                        showScene
                      />
                    </div>
                  ) : (
                    <ItemWithEffects
                      item={quest}
                      showEdit="quest"
                      imageExtra={
                        <Button
                          className="mt-2"
                          onClick={() =>
                            startQuest({
                              questId: quest.id,
                              userSector: userData.sector,
                            })
                          }
                        >
                          <Gamepad2 className="mr-1 h-6 w-6" />
                          Take Quest
                        </Button>
                      }
                      hideTitle
                    />
                  )}
                </Accordion>
              </div>
            );
          })}
        </div>
      )}
    </ContentBox>
  );
}
