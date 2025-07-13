"use client";

import React from "react";
import ContentBox from "@/layout/ContentBox";

export default function OccupationHunter() {
  return (
    <ContentBox 
      title="Hunter" 
      subtitle="Hunt creatures and enemies"
      initialBreak
    >
      <p className="text-muted-foreground">
        This is a placeholder component for the Hunter occupation. 
        Functionality will be implemented later.
      </p>
    </ContentBox>
  );
}