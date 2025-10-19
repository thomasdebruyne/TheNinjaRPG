"use client";

import ContentBox from "@/layout/ContentBox";
import { SignUp } from "@clerk/nextjs";

export default function SignupUser() {
  return (
    <ContentBox
      title="Create Account"
      subtitle="To create please use one of below providers"
      alreadyHasH1
      defaultBackHref="/"
    >
      <div className="flex flex-row items-center justify-center">
        <SignUp
          path="/signup"
          routing="path"
          appearance={{
            elements: {
              rootBox: "!w-full",
              cardBox: "!w-full",
              socialButtons: "!grid-cols-5",
            },
          }}
        />
      </div>
    </ContentBox>
  );
}
