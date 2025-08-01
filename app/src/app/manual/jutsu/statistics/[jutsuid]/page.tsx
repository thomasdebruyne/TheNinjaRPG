"use client";
import { use } from "react";

import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import { jutsuText } from "@/layout/seoTexts";
import { useUserData } from "@/utils/UserContext";
import { api } from "@/app/_trpc/client";
import { UsageStats, LevelStats } from "@/layout/UsageStatistics";
import StatisticsFiltering, {
  useFiltering as useStatisticsFiltering,
  getFilter as getStatisticsFilter,
} from "@/layout/StatisticsFiltering";

export default function JutsuStatistics(props: {
  params: Promise<{ jutsuid: string }>;
}) {
  const params = use(props.params);
  const jutsuId = params.jutsuid;

  // Queries
  const statsFilter = useStatisticsFiltering();
  const filterParams = getStatisticsFilter(statsFilter);

  const { data: userData } = useUserData();
  const { data, isPending } = api.data.getStatistics.useQuery(
    { id: jutsuId, type: "jutsu", ...filterParams },
    { enabled: !!jutsuId },
  );
  const jutsu = data?.info;
  const filteredUsage = data?.usage;
  const totalUsers = data?.totalUsers ?? 0;
  const levelDistribution = data?.levelDistribution;
  const total = filteredUsage?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;
  const name = jutsu && "name" in jutsu ? jutsu.name : "";

  // Prevent unauthorized access
  if (isPending) return <Loader explanation="Loading data" />;

  // Show panel controls
  return (
    <>
      {!userData && jutsu && "name" in jutsu && (
        <ContentBox
          title="Jutsu Statistics"
          subtitle={jutsu.name}
          back_href="/manual/jutsu"
        >
          {jutsuText(jutsu.name)}
        </ContentBox>
      )}
      <ContentBox
        title={`Jutsu: ${name}`}
        subtitle={`Total users: ${totalUsers}`}
        initialBreak={!userData && !!jutsu}
        back_href={userData ? "/manual/jutsu" : undefined}
      >
        {levelDistribution && (
          <LevelStats
            levelDistribution={levelDistribution}
            title="#Users vs. Jutsu Level"
            xaxis="Jutsu Level"
          />
        )}
      </ContentBox>
      <ContentBox
        title="Usage Statistics"
        subtitle={`Total battles: ${total}`}
        initialBreak={true}
        topRightContent={<StatisticsFiltering state={statsFilter} />}
      >
        {filteredUsage && <UsageStats usage={filteredUsage} />}
      </ContentBox>
    </>
  );
}
