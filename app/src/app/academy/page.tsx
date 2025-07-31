"use client";

import QuestPicker from "@/layout/QuestPicker";
import ContentBox from "@/layout/ContentBox";
import Image from "next/image";
import { IMG_BUILDING_ACADEMY } from "@/drizzle/constants";

export default function Academy() {
  // Show board
  return (
    <>
      <ContentBox
        title="Academy"
        subtitle="Learning the ropes"
        back_href="/village"
        padding={false}
      >
        <Image
          alt="academy-image"
          src={IMG_BUILDING_ACADEMY}
          width={512}
          height={195}
          className="w-full"
          priority={true}
        />
      </ContentBox>
      <QuestPicker
        questType="starter"
        title="Lessons"
        subtitle="Learning the ropes"
        initialBreak={true}
      />
    </>
  );
}
