"use client";

import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import BanInfo from "@/layout/BanInfo";
import { useRequireInVillage } from "@/utils/UserContext";
import NavTabs from "@/layout/NavTabs";
import BountyBoard from "@/layout/BountyBoard";
import MissionHall from "@/layout/MissionHall";
import React from "react";
import { useLocalStorage } from "@/hooks/localstorage";

export default function MissionHallPage() {
  const { userData, access } = useRequireInVillage("/missionhall");

  const [activeTab, setActiveTab] = useLocalStorage<string>(
    "MissionHallTab",
    "Missions",
  );
  const showMissions = activeTab === "Missions";
  const showBounties = activeTab === "Bounties";

  if (!userData) return <Loader explanation="Loading userdata" />;
  if (!access) return <Loader explanation="Accessing Hall" />;
  if (userData.isBanned) return <BanInfo />;

  return (
    <ContentBox
      title={userData.isOutlaw ? "Crimes Board" : "Mission Hall"}
      subtitle={
        userData.isOutlaw ? "Small and big assignments" : "Help the village grow"
      }
      back_href="/village"
      padding={false}
      topRightContent={
        <NavTabs
          current={activeTab}
          options={["Missions", "Bounties"]}
          setValue={setActiveTab}
        />
      }
    >
      {showMissions && <MissionHall userData={userData} />}
      {showBounties && <BountyBoard userData={userData} />}
    </ContentBox>
  );
}
