"use client";

import React, { useEffect, useMemo, useRef } from "react";
import ContentBox from "@/layout/ContentBox";
import { api } from "@/app/_trpc/client";
import Loader from "@/layout/Loader";
import { Chart as ChartJS } from "chart.js/auto";

type VariantAgg = { variant: string; loaded: number; register: number };
type ExperimentAgg = { experiment: string; variants: VariantAgg[] };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Beta posterior moments with uniform prior Beta(1,1)
const betaPosterior = (conversions: number, total: number) => {
  const a = conversions + 1;
  const b = total - conversions + 1;
  const mean = a / (a + b);
  const variance = (a * b) / ((a + b) ** 2 * (a + b + 1));
  return { mean, variance };
};

// Standard normal CDF approximation
const stdNormCDF = (x: number) => {
  // Abramowitz and Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let prob =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) prob = 1 - prob;
  return prob;
};

const normPDF = (x: number, mean: number, sd: number) => {
  if (sd <= 0) return 0;
  const z = (x - mean) / sd;
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
};

const DistributionChart: React.FC<{
  title: string;
  labels: number[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fill?: boolean;
    fillColor?: string;
    borderWidth?: number;
  }[];
  yTitle?: string;
}> = ({ title, labels, datasets, yTitle = "Density" }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const chart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.fill ? (d.fillColor ?? d.color) : d.color,
          pointRadius: 0,
          borderWidth: d.borderWidth ?? 2,
          fill: d.fill ? "origin" : false,
          tension: 0.2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: "linear", title: { display: true, text: title } },
          y: { type: "linear", title: { display: true, text: yTitle } },
        },
        plugins: { legend: { display: true } },
      },
    });
    return () => chart.destroy();
  }, [labels, datasets, title, yTitle]);
  return (
    <div className="w-full" style={{ height: 260 }}>
      <canvas ref={ref} />
    </div>
  );
};

const ExperimentRow: React.FC<{ exp: ExperimentAgg }> = ({ exp }) => {
  const [a, b] = useMemo(() => {
    const vs = [...exp.variants].sort((x, y) => x.variant.localeCompare(y.variant));
    return [vs[0], vs[1]] as [VariantAgg | undefined, VariantAgg | undefined];
  }, [exp.variants]);

  if (!a || !b) return null;

  const aStats = betaPosterior(a.register, Math.max(1, a.loaded));
  const bStats = betaPosterior(b.register, Math.max(1, b.loaded));
  const aMean = aStats.mean;
  const bMean = bStats.mean;
  const aSd = Math.sqrt(aStats.variance);
  const bSd = Math.sqrt(bStats.variance);
  const diffMean = bMean - aMean;
  const diffSd = Math.sqrt(aSd * aSd + bSd * bSd);
  const pBgtA = 1 - stdNormCDF((0 - diffMean) / diffSd);
  const pAgtB = 1 - pBgtA;
  const relLift = (bMean - aMean) / Math.max(1e-9, aMean);

  const x = Array.from({ length: 200 }, (_, i) => i / 199);
  const aPdf = x.map((xi) => normPDF(xi, clamp01(aMean), aSd));
  const bPdf = x.map((xi) => normPDF(xi, clamp01(bMean), bSd));

  const impX = Array.from({ length: 200 }, (_, i) => -0.5 + (i / 199) * 1.0);
  const impPdf = impX.map((xi) => normPDF(xi, diffMean, diffSd));
  // Build a smooth, filled shape for the improvement distribution
  // Guard against undefined by defaulting to 0 for masked points
  const posPdf = impX.map((xi, i) => (xi >= 0 ? (impPdf?.[i] ?? 0) : 0));
  const negPdf = impX.map((xi, i) => (xi < 0 ? (impPdf?.[i] ?? 0) : 0));

  return (
    <div className="rounded-md border p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">Conversion Rate Distributions</div>
        <DistributionChart
          title="Conversion rate"
          labels={x}
          datasets={[
            {
              label: `${a.variant} (n=${a.loaded}, conv=${a.register})`,
              data: aPdf,
              color: "hsl(42 90% 45%)",
            },
            {
              label: `${b.variant} (n=${b.loaded}, conv=${b.register})`,
              data: bPdf,
              color: "hsl(210 70% 45%)",
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold">Improvement Distribution</div>
        <DistributionChart
          title={`Improvement (${b.variant} - ${a.variant})`}
          labels={impX}
          datasets={[
            {
              label: `${b.variant} better`,
              data: posPdf,
              color: "hsl(210 70% 45%)",
              fill: true,
              fillColor: "hsl(210 70% 45% / 0.35)",
              borderWidth: 1,
            },
            {
              label: `${a.variant} better`,
              data: negPdf,
              color: "hsl(42 90% 45%)",
              fill: true,
              fillColor: "hsl(42 90% 45% / 0.35)",
              borderWidth: 1,
            },
            {
              label: "density",
              data: impPdf,
              color: "hsl(210 10% 20%)",
              fill: false,
              borderWidth: 2,
            },
          ]}
        />
      </div>
      <div className="md:col-span-2 text-sm">
        <div className="font-semibold">Executive Summary</div>
        <div>
          {b.variant}’s observed conversion rate ({(bMean * 100).toFixed(1)}%) was{" "}
          {(Math.abs(relLift) * 100).toFixed(1)}% {relLift >= 0 ? "higher" : "lower"}{" "}
          than {a.variant}’s conversion rate ({(aMean * 100).toFixed(1)}%).
        </div>
        <div>
          There is a {(pBgtA * 100).toFixed(1)}% chance that {b.variant} has a higher
          conversion rate and {(pAgtB * 100).toFixed(1)}% chance that {a.variant} has a
          higher conversion rate. The green area under the improvement curve shows where{" "}
          {b.variant} outperforms {a.variant}, and the red area shows where
          {a.variant} performs better.
        </div>
      </div>
    </div>
  );
};

export const AbTestResults: React.FC = () => {
  const { data, isFetching } = api.data.getAbTests.useQuery(undefined, {
    staleTime: 60_000,
  });

  return (
    <ContentBox title="A/B Tests" subtitle="Live results from experiments" initialBreak>
      {isFetching && <Loader explanation="Loading A/B test results" />}
      {!isFetching && (!data || data.length === 0) && <p>No experiments found.</p>}
      {!isFetching && data && data.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.map((exp) => (
            <div key={exp.experiment} className="flex flex-col gap-2">
              <div className="text-lg font-bold">{exp.experiment}</div>
              <ExperimentRow exp={exp} />
            </div>
          ))}
        </div>
      )}
    </ContentBox>
  );
};

export default AbTestResults;
