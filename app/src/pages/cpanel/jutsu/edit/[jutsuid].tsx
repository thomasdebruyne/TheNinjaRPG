import { useEffect, useState } from "react";
import { useSafePush } from "@/utils/routing";
import ContentBox from "@/layout/ContentBox";
import Loader from "@/layout/Loader";
import { EditContent } from "@/layout/EditContent";
import { TagFormWrapper } from "@/layout/EditContent";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { DocumentMinusIcon } from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { useRequiredUserData } from "@/utils/UserContext";
import { DamageTag } from "@/libs/combat/types";
import { JutsuValidator } from "@/libs/combat/types";
import { canChangeContent } from "@/utils/permissions";
import { tagTypes } from "@/libs/combat/types";
import { useJutsuEditForm } from "@/libs/jutsu";
import type { Jutsu } from "@/drizzle/schema";
import type { NextPage } from "next";

const JutsuPanel: NextPage = () => {
  // State
  const router = useSafePush();
  const jutsuId = router.query.jutsuid as string;
  const { data: userData } = useRequiredUserData();

  // Queries
  const { data, isLoading, refetch } = api.jutsu.get.useQuery(
    { id: jutsuId },
    { staleTime: Infinity, enabled: jutsuId !== undefined }
  );

  // Convert key null values to empty strings, preparing data for form
  // setNullsToEmptyStrings(data);

  // Redirect to profile if not content or admin
  useEffect(() => {
    if (userData && !canChangeContent(userData.role)) {
      void router.push("/profile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // Prevent unauthorized access
  if (isLoading || !userData || !canChangeContent(userData.role) || !data) {
    return <Loader explanation="Loading data" />;
  }

  return <SingleEditJutsu jutsu={data} refetch={refetch} />;
};

export default JutsuPanel;

interface SingleEditJutsuProps {
  jutsu: Jutsu;
  refetch: () => void;
}

const SingleEditJutsu: React.FC<SingleEditJutsuProps> = (props) => {
  // State for forcing re-render
  const [, setRender] = useState<number>(0);

  // Form handling
  const {
    jutsu,
    refEffects,
    form: {
      setValue,
      register,
      formState: { isDirty, errors },
    },
    formData,
    handleJutsuSubmit,
  } = useJutsuEditForm(props.jutsu, props.refetch);

  // Icon for adding tag
  const AddTagIcon = (
    <DocumentPlusIcon
      className="h-6 w-6 cursor-pointer hover:fill-orange-500"
      onClick={() => {
        refEffects.current.push(DamageTag.parse({ description: "placeholder" }));
        setRender((r) => r + 1);
      }}
    />
  );

  // Show panel controls
  return (
    <>
      <ContentBox
        title="Content Panel"
        subtitle="Jutsu Management"
        back_href="/manual/jutsus"
      >
        {!jutsu && <p>Could not find this jutsu</p>}
        {jutsu && (
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <EditContent
              schema={JutsuValidator._def.schema}
              showSubmit={isDirty}
              buttonTxt="Save to Database"
              setValue={setValue}
              register={register}
              errors={errors}
              formData={formData}
              onAccept={handleJutsuSubmit}
            />
          </div>
        )}
      </ContentBox>

      {refEffects.current.length === 0 && (
        <ContentBox
          title={`Jutsu Tags`}
          initialBreak={true}
          topRightContent={<div className="flex flex-row">{AddTagIcon}</div>}
        >
          Please add effects to this jutsu
        </ContentBox>
      )}
      {refEffects.current.map((tag, i) => {
        return (
          <ContentBox
            key={i}
            title={`Jutsu Tag #${i + 1}`}
            subtitle="Control battle effects"
            initialBreak={true}
            topRightContent={
              <div className="flex flex-row">
                {AddTagIcon}
                <DocumentMinusIcon
                  className="h-6 w-6 cursor-pointer hover:fill-orange-500"
                  onClick={() => {
                    const newEffects = [...refEffects.current];
                    newEffects.splice(i, 1);
                    refEffects.current = newEffects;
                    setRender((r) => r + 1);
                  }}
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 items-center">
              <TagFormWrapper
                idx={i}
                tag={tag}
                availableTags={tagTypes}
                refEffects={refEffects}
              />
            </div>
          </ContentBox>
        );
      })}
    </>
  );
};
