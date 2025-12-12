"use client";

import NextImage from "next/image";
import type { ImageProps } from "next/image";

/**
 * Transforms image URLs to use the CDN endpoint.
 * Replaces "utfs.io" or "ui0arpl8sm.ufs.sh" with "uploadthing.b-cdn.net"
 */
export const transformImageUrl = (src: ImageProps["src"]): ImageProps["src"] => {
  if (typeof src === "string") {
    return src
      .replace(/utfs\.io/g, "uploadthing.b-cdn.net")
      .replace(/ui0arpl8sm\.ufs\.sh/g, "uploadthing.b-cdn.net");
  }
  return src;
};

/**
 * Custom Image component that extends Next.js Image.
 * Automatically transforms UploadThing URLs to use the CDN endpoint.
 */
const Image: React.FC<ImageProps> = ({ src, ...props }) => {
  return <NextImage src={transformImageUrl(src)} {...props} />;
};

export default Image;
