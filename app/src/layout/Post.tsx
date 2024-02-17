import React from "react";
import AvatarImage from "@/layout/Avatar";
import Link from "next/link";
import { capitalizeFirstLetter } from "@/utils/sanitize";
import type { UserRank, UserRole, FederalStatus } from "@/drizzle/constants";

export interface PostProps {
  user?: {
    userId: string;
    username: string;
    avatar: string | null;
    level: number;
    rank: UserRank;
    role: UserRole;
    villageName?: string | null;
    villageHexColor?: string | null;
    nRecruited?: number | null;
    federalStatus: FederalStatus;
  };
  className?: string;
  image?: React.ReactNode;
  title?: string;
  color?: "default" | "green" | "red" | "blue";
  children: any;
  options?: React.ReactNode;
  align_middle?: boolean;
  hover_effect?: boolean;
}

const Post: React.FC<PostProps> = (props) => {
  let userColor = "text-gray-900";
  let color = "bg-orange-50";
  let hover = "hover:bg-orange-100";

  switch (props.color) {
    case "green":
      color = "bg-green-200";
      hover = "hover:bg-green-300";
      break;
    case "red":
      color = "bg-red-300";
      hover = "hover:bg-red-400";
      break;
    case "blue":
      color = "bg-blue-200";
      hover = "hover:bg-blue-300";
      break;
  }

  switch (props.user?.federalStatus) {
    case "NORMAL":
      userColor =
        "bg-gradient-to-r from-blue-800 via-blue-500 to-blue-800 bg-clip-text text-transparent font-black";
      break;
    case "SILVER":
      userColor =
        "bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 bg-clip-text text-transparent font-black";
      break;
    case "GOLD":
      userColor =
        "bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 bg-clip-text text-transparent font-black";
      break;
  }

  switch (props.user?.role) {
    case "MODERATOR":
      userColor =
        "bg-gradient-to-r from-green-800 via-green-500 to-green-800 bg-clip-text text-transparent font-black";
      break;
    case "CONTENT":
      userColor =
        "bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 bg-clip-text text-transparent font-black";
      break;
    case "CONTENT-ADMIN":
      userColor =
        "bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 bg-clip-text text-transparent font-black";
      break;
    case "ADMIN":
      userColor =
        "bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent font-black";
      break;
  }

  // Blocks
  const UsernameBlock = props.user && (
    <div className="basis-1/4">
      <div className={userColor}>{props.user.username}</div>
      <div className="text-xs pt-1 pb-4">
        <span className="bg-slate-300 p-1 m-1 rounded-md">Lvl. {props.user.level}</span>
        <span className="bg-slate-300 p-1 m-1 rounded-md">
          {capitalizeFirstLetter(props.user.rank)}
        </span>
        {props.user.villageName && props.user.villageHexColor && (
          <span
            className="p-1 m-1 rounded-md"
            style={{ backgroundColor: props.user.villageHexColor }}
          >
            {props.user.villageName}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`relative mb-3 flex flex-row ${
        props.align_middle ? "items-center" : ""
      } rounded-lg border ${color} px-1 py-3 shadow ${props.hover_effect ? hover : ""} ${
        props.className ? props.className : ""
      }`}
    >
      {props.image}
      {props.user && (
        <div className="... mr-3 basis-2/12 truncate text-center sm:basis-3/12 sm:text-base">
          <Link href={`/users/${props.user.userId}`}>
            <AvatarImage
              href={props.user.avatar}
              userId={props.user.userId}
              alt={props.user.username}
              size={100}
            />
          </Link>
          {props.user.nRecruited && props.user.nRecruited > 0 ? (
            <Link
              href={`/users/${props.user.userId}`}
              className="font-bold hover:text-orange-500 text-xs"
            >
              Recruits: {props.user.nRecruited}
            </Link>
          ) : undefined}
        </div>
      )}
      <div className="grow basis-1/2">
        <div className="flex flex-col h-full justify-center">
          {props.title && (
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 basis-1/5">
              {props.title}
            </h3>
          )}
          {UsernameBlock}
          <div className="relative font-normal text-gray-900 basis-3/4 ">
            {props.children}
          </div>
        </div>
      </div>
      {props.options && <div className="absolute right-3 top-3">{props.options}</div>}
    </div>
  );
};

export default Post;
