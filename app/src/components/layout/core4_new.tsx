/**
 * DEPRECATED - DO NOT USE THIS LAYOUT
 * This can be used together with the layoutSwitcher for testing different landing page layouts
 */

"use client";

import ReactDOM from "react-dom";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { getImageSet } from "@/components/layout/core4_default";
import { LogIn, Menu, Music } from "lucide-react";
import { getMainNavbarLinks } from "@/libs/menus";
import { GlobalAudioProvider } from "@/layout/AudioSettings";
import LowerRightHelpBtn from "@/layout/LowerRightHelpBtn";
import { useUserData } from "@/utils/UserContext";
import { cn } from "src/libs/shadui";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export interface LayoutProps {
  children: React.ReactNode;
}

const LayoutCore4New: React.FC<LayoutProps> = (props) => {
  // Prefetching
  ReactDOM.prefetchDNS("https://o4507797256601600.ingest.de.sentry.io");
  ReactDOM.prefetchDNS("https://consentcdn.cookiebot.com");
  ReactDOM.prefetchDNS("https://region1.analytics.google.com");
  ReactDOM.prefetchDNS("https://connect.facebook.net");
  ReactDOM.prefetchDNS("https://api.github.com");

  // Get data
  const { data: userData, notifications } = useUserData();

  // Derived data for layout
  const navbarMenuItems = getMainNavbarLinks(notifications);

  // Images
  const imageset = getImageSet(userData);

  // Styling for yellow buttons
  const navBarButtonStyle =
    "h-14 w-14 sm:h-15 sm:w-15 md:h-16 md:w-16 bg-yellow-500 hover:bg-yellow-300 transition-colors text-orange-100 rounded-full p-3 shadow-md shadow-black border-2 stroke-3";

  return (
    <GlobalAudioProvider userData={userData}>
      <div className="">
        {/* WALLPAPER BACKGROUND */}
        <Image
          className="fixed top-0 left-0 w-full h-full object-cover z-[-1] select-none"
          src={imageset.wallpaper}
          width={1600}
          height={800}
          alt="wallpaper"
          loading="eager"
          priority
          unoptimized
        />

        {/* LEFT MENU BUTTON - Menubar Dropdown */}
        {/* 
          The trigger is now vertically aligned (top-4) like the other icons, 
          by moving the fixed positioning to the wrapping div instead of to a child of the trigger.
        */}
        <div className="fixed top-8 left-4 z-[99]">
          <Menubar className="border-0 p-0 bg-transparent shadow-none">
            <MenubarMenu>
              <MenubarTrigger
                className={cn(
                  navBarButtonStyle,
                  "flex items-center justify-center rounded-full focus:bg-yellow-400",
                )}
              >
                <Menu />
              </MenubarTrigger>
              <MenubarContent
                align="start"
                side="bottom"
                className="z-[99] min-w-[12rem] p-1 ml-0"
              >
                {navbarMenuItems.map((item, i) => {
                  const count = item.notificationCount ?? 0;
                  return (
                    <Link key={i} href={item.href} prefetch={false} tabIndex={-1}>
                      <MenubarItem
                        onClick={async () => {
                          if (item.onClick) await item.onClick();
                        }}
                        className="flex items-center gap-2"
                      >
                        {item.icon}
                        {item.name}
                        {count > 0 && (
                          <span className="ml-auto flex items-center justify-center text-xs text-orange-100 bg-orange-500 rounded-full w-5 h-5">
                            {count}
                          </span>
                        )}
                      </MenubarItem>
                    </Link>
                  );
                })}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* RIGHT LOGIN BUTTON */}
        <div className="absolute top-4 right-4 z-[99] flex flex-row gap-2">
          <LowerRightHelpBtn>
            <Music className={cn(navBarButtonStyle)} />
          </LowerRightHelpBtn>
          <Link href="/login" aria-label="Login">
            <LogIn className={cn(navBarButtonStyle)} />
          </Link>
        </div>

        {props.children}
      </div>
    </GlobalAudioProvider>
  );
};
export default LayoutCore4New;
