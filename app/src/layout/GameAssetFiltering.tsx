import {
  ContentFiltering,
  useContentFiltering,
  buildFilter,
  defineFilteringSchema,
  toOptions,
} from "@/layout/ContentFiltering";
import { GameAssetTypes } from "@/drizzle/constants";

interface GameAssetFilteringProps {
  state: GameAssetFilteringState;
}

const makeGameAssetSchema = () =>
  defineFilteringSchema({
    fields: [
      { id: "name", label: "Name", type: "text", defaultValue: "" },
      {
        id: "type",
        label: "Type",
        type: "single-select",
        defaultValue: "STATIC",
        includeNone: false,
        emptyValues: [],
        options: toOptions(GameAssetTypes),
      },
      { id: "folder", label: "Folder", type: "text", defaultValue: "" },
    ] as const,
  });

const GameAssetFiltering: React.FC<GameAssetFilteringProps> = (props) => {
  return (
    <ContentFiltering
      schema={makeGameAssetSchema()}
      state={props.state.cf}
      triggerButtonId="filter-assets"
    />
  );
};

export default GameAssetFiltering;

export const getFilter = (state: GameAssetFilteringState) =>
  buildFilter(state.cf, makeGameAssetSchema());

export const useFiltering = () => {
  const cf = useContentFiltering(makeGameAssetSchema());
  return {
    ...cf.values,
    cf,
    setName: cf.setters.name,
    setType: cf.setters.type,
    setFolder: cf.setters.folder,
  };
};

export type GameAssetFilteringState = ReturnType<typeof useFiltering>;
