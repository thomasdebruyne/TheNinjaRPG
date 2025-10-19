"use client";

import ContentBox from "@/layout/ContentBox";
import { SignIn } from "@clerk/nextjs";

export default function LoginUser() {
  return (
    <ContentBox
      title="Login"
      subtitle="To login please use one of below providers"
      alreadyHasH1
      defaultBackHref="/"
    >
      <div className="flex flex-row items-center justify-center">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
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
