"use client";

import { FileMinus, FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { api } from "@/app/_trpc/client";
import { insertAiSchema } from "@/drizzle/schema";
import AiProfileEdit from "@/layout/AiProfileEdit";
import ContentBox from "@/layout/ContentBox";
import { AiHelper } from "@/layout/ContentHelp";
import { EditContent, EffectFormWrapper } from "@/layout/EditContent";
import Loader from "@/layout/Loader";
import NindoChange from "@/layout/NindoChange";
import StatusBar from "@/layout/StatusBar";
import { useAiEditForm } from "@/libs/ais";
import { showMutationToast } from "@/libs/toast";
import type { AiWithRelations } from "@/routers/profile";
import { canChangeContent } from "@/utils/permissions";
import { setNullsToEmptyStrings } from "@/utils/typeutils";
import { useRequiredUserData } from "@/utils/UserContext";
import { tagTypes, WeaknessTag } from "@/validators/combat";

export default function ManualAisEdit(props: { params: Promise<{ aiid: string }> }) {
  const params = use(props.params);
  // State
  const aiId = params.aiid;
  const router = useRouter();
  const { data: userData } = useRequiredUserData();

  // Queries
  const { data, isPending, refetch } = api.profile.getAi.useQuery(
    { userId: aiId },
    { enabled: aiId !== undefined },
  );

  // Convert key null values to empty strings, preparing data for form
  setNullsToEmptyStrings(data);

  // Redirect to profile if not content or admin
  useEffect(() => {
    if (userData && !canChangeContent(userData.role)) {
      router.push("/profile");
    }
  }, [userData]);

  // Prevent unauthorized access
  if (isPending || !userData || !canChangeContent(userData.role) || !data) {
    return <Loader explanation="Loading data" />;
  }

  return <SingleEditUser user={data} refetch={refetch} />;
}

interface SingleEditUserProps {
  user: AiWithRelations;
  refetch: () => void;
}

const SingleEditUser: React.FC<SingleEditUserProps> = (props) => {
  // tRPC utility
  const utils = api.useUtils();

  // Form handling
  const {
    loading,
    effects,
    processedUser,
    form,
    formData,
    setEffects,
    handleUserSubmit,
  } = useAiEditForm(props.user);

  // Mutations
  const { mutate: updateNindo, isPending: isUpdating } =
    api.profile.updateNindo.useMutation({
      onSuccess: async (data) => {
        showMutationToast(data);
        if (data.success) {
          await utils.profile.getNindo.invalidate();
        }
      },
    });

  // Icon for adding tag
  const AddTagIcon = (
    <FilePlus
      className="h-6 w-6 cursor-pointer hover:text-orange-500"
      onClick={() => {
        setEffects([
          ...effects,
          WeaknessTag.parse({
            rounds: 100,
            residualModifier: 0,
            dmgModifier: 1,
          }),
        ]);
      }}
    />
  );

  // Show panel controls
  return (
    <>
      <ContentBox
        title="Content Panel"
        subtitle="Note: stats scaled by level!"
        defaultBackHref="/manual/ai"
        topRightContent={
          <AiHelper
            ai={{
              userId: processedUser.userId,
              username: processedUser.username,
            }}
          />
        }
      >
        {!processedUser && <p>Could not find this AI</p>}
        {!loading && processedUser && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-bold text-2xl">Edit AI</h1>
            </div>
            <StatusBar
              title="HP"
              tooltip="Health"
              color="bg-red-500"
              showText={true}
              status={processedUser.status}
              current={processedUser.curHealth}
              total={processedUser.maxHealth}
            />
            <StatusBar
              title="CP"
              tooltip="Chakra"
              color="bg-blue-500"
              showText={true}
              status={processedUser.status}
              current={processedUser.curChakra}
              total={processedUser.maxChakra}
            />
            <StatusBar
              title="SP"
              tooltip="Stamina"
              color="bg-green-500"
              showText={true}
              status={processedUser.status}
              current={processedUser.curStamina}
              total={processedUser.maxStamina}
            />
            <EditContent
              schema={insertAiSchema}
              form={form}
              formData={formData}
              showSubmit={true}
              buttonTxt="Save to Database"
              type="ai"
              relationId={processedUser.userId}
              allowImageUpload={true}
              onAccept={handleUserSubmit}
            />
          </>
        )}
      </ContentBox>

      {effects.length === 0 && (
        <ContentBox
          title="AI Tags"
          initialBreak={true}
          topRightContent={<div className="flex flex-row">{AddTagIcon}</div>}
        >
          Please add effects to this item
        </ContentBox>
      )}
      {effects.map((tag, i) => {
        return (
          <ContentBox
            key={`${tag.type}-${i}`}
            title={`AI Tag #${i + 1}`}
            subtitle="Control battle effects"
            initialBreak={true}
            topRightContent={
              <div className="flex flex-row">
                {AddTagIcon}
                <FileMinus
                  className="h-6 w-6 cursor-pointer hover:text-orange-500"
                  onClick={() => {
                    const newEffects = [...effects];
                    newEffects.splice(i, 1);
                    setEffects(newEffects);
                  }}
                />
              </div>
            }
          >
            <EffectFormWrapper
              idx={i}
              type="item"
              tag={tag}
              availableTags={tagTypes}
              effects={effects}
              setEffects={setEffects}
            />
          </ContentBox>
        );
      })}

      <AiProfileEdit userData={props.user} />

      <ContentBox title="Nindo" subtitle="Edit the AI Nindo" initialBreak>
        {isUpdating && <Loader explanation="Updating..." />}
        {!isUpdating && (
          <NindoChange
            userId={processedUser.userId}
            onChange={(data) =>
              updateNindo({
                userId: processedUser.userId,
                content: data.content,
              })
            }
          />
        )}
      </ContentBox>
    </>
  );
};
