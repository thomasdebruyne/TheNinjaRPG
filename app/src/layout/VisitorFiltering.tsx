import {
  ContentFiltering,
  useContentFiltering,
  buildFilter,
  defineFilteringSchema,
} from "@/layout/ContentFiltering";

// Helper: get date string (YYYY-MM-DD) for N days ago
const dateStringDaysAgo = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Inline schema for visitor analytics filters
const visitorFilteringSchema = defineFilteringSchema({
  fields: [
    {
      id: "utmSource",
      label: "UTM Source",
      type: "single-select",
      defaultValue: "reddit",
      dataSource: "visitorUtmSources",
      includeNone: true,
      noneOption: { value: "None", label: "All" },
      emptyValues: ["None"],
    },
    {
      id: "startDate",
      label: "First Visit (From)",
      type: "date",
      defaultValue: dateStringDaysAgo(7),
    },
    {
      id: "endDate",
      label: "First Visit (To)",
      type: "date",
      defaultValue: "",
    },
  ] as const,
});

interface VisitorFilteringProps {
  state: VisitorFilteringState;
}

const VisitorFiltering: React.FC<VisitorFilteringProps> = (props) => {
  return (
    <ContentFiltering
      schema={visitorFilteringSchema}
      state={props.state.cf}
      triggerButtonId="filter-visitor"
    />
  );
};

export default VisitorFiltering;

export const getFilter = (state: VisitorFilteringState) =>
  buildFilter(state.cf, visitorFilteringSchema);

export const useFiltering = () => {
  const cf = useContentFiltering(visitorFilteringSchema);
  return {
    ...cf.values,
    cf,
    setUtmSource: cf.setters.utmSource,
    setStartDate: cf.setters.startDate,
    setEndDate: cf.setters.endDate,
  };
};

export type VisitorFilteringState = ReturnType<typeof useFiltering>;
