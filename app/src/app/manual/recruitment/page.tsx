"use client";

import React from "react";
import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import { api } from "@/app/_trpc/client";
import { useUserData } from "@/utils/UserContext";
import { canViewRecruitmentAnalytics } from "@/utils/permissions";
import RecruitmentFiltering, {
  useFiltering as useRecruitmentFiltering,
  getFilter as getRecruitmentFilter,
} from "@/layout/RecruitmentFiltering";
import {
  GroupedLevelStats,
  DailyMeanStdChart,
  DailyCountsBySourceChart,
} from "@/layout/UsageStatistics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecruitmentMetrics, type RecruitmentMetric } from "@/drizzle/constants";

export default function ManualRecruitment() {
  const { data: currentUser } = useUserData();
  const allowed = canViewRecruitmentAnalytics(currentUser?.role ?? "USER");
  const filterState = useRecruitmentFiltering();
  const filter = getRecruitmentFilter(filterState) as {
    sources?: string[];
    startDate?: string;
    endDate?: string;
    metric?: RecruitmentMetric;
  };

  const [metric, setMetric] = React.useState<RecruitmentMetric>("level");
  const metricLabel =
    metric === "completedQuests"
      ? "Completed Quests"
      : metric === "level"
        ? "User Level"
        : metric;

  const { data, isFetching } = api.data.getRecruitmentLevelDistribution.useQuery(
    { ...filter, metric },
    { staleTime: 1000 * 60, enabled: allowed },
  );

  const { data: daily, isFetching: isFetchingDaily } =
    api.data.getRecruitmentDailyLevelStats.useQuery(filter, {
      staleTime: 1000 * 60,
      enabled: allowed,
    });

  const { data: dailyBySource, isFetching: isFetchingDailyBySource } =
    api.data.getRecruitmentDailyCountsBySource.useQuery(filter, {
      staleTime: 1000 * 60,
      enabled: allowed,
    });

  return (
    <>
      <ContentBox
        title="Recruitment"
        subtitle="Overview of recruitment statistics"
        defaultBackHref="/manual"
      >
        {!allowed && <p>You do not have permission to view this page.</p>}
        {allowed && (
          <p>
            This page shows recruitment insights, which are used to track user adoption
            and optimize game experience.
          </p>
        )}
      </ContentBox>

      {allowed && (
        <ContentBox
          title="Stats Distribution"
          subtitle="Grouped by recruitment source"
          initialBreak
          topRightContent={
            <div className="flex items-center gap-2">
              <div>
                <Select
                  value={metric}
                  onValueChange={(v) => setMetric(v as typeof metric)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {RecruitmentMetrics.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m === "level"
                          ? "Level"
                          : m === "completedQuests"
                            ? "Completed Quests"
                            : m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <RecruitmentFiltering state={filterState} />
            </div>
          }
        >
          {isFetching && <Loader explanation="Loading level distributions" />}
          {!isFetching && data && data.length > 0 && (
            <GroupedLevelStats
              datasets={data}
              title={`#Users vs. ${metricLabel}`}
              xaxis={metricLabel}
            />
          )}
          {!isFetching && (!data || data.length === 0) && (
            <p>No data found for filters.</p>
          )}
        </ContentBox>
      )}

      {allowed && (
        <ContentBox
          title="Daily Level (Mean ± Std)"
          subtitle="Current level vs. recruitment date"
          initialBreak={true}
          topRightContent={<RecruitmentFiltering state={filterState} />}
        >
          {isFetchingDaily && <Loader explanation="Loading daily level stats" />}
          {!isFetchingDaily && daily && daily.length > 0 && (
            <DailyMeanStdChart
              data={daily}
              title="Avg Level per Day"
              yaxis="User Level"
            />
          )}
          {!isFetchingDaily && (!daily || daily.length === 0) && (
            <p>No data found for filters.</p>
          )}
        </ContentBox>
      )}

      {allowed && (
        <ContentBox
          title="Daily Recruits by Source"
          subtitle="# of recruited users per day (by source)"
          initialBreak={true}
          topRightContent={<RecruitmentFiltering state={filterState} />}
        >
          {isFetchingDailyBySource && (
            <Loader explanation="Loading daily recruits by source" />
          )}
          {!isFetchingDailyBySource && dailyBySource && dailyBySource.length > 0 && (
            <DailyCountsBySourceChart
              datasets={dailyBySource}
              title="Recruits per Day"
            />
          )}
          {!isFetchingDailyBySource &&
            (!dailyBySource || dailyBySource.length === 0) && (
              <p>No data found for filters.</p>
            )}
        </ContentBox>
      )}
    </>
  );
}
