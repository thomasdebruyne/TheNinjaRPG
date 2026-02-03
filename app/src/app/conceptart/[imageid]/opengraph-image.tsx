import { ImageResponse } from "next/og";
import { drizzleDB } from "@/server/db";
import { eq } from "drizzle-orm";
import { conceptImage } from "@/drizzle/schema";

// Route segment config
export const runtime = "nodejs";

// Image metadata
export const alt = "TheNinja-RPG Concept Art";

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: Promise<{ imageid: string }>;
}) {
  // Await params as per Next.js 16 requirements
  const { imageid } = await params;

  // Get the image
  const image = await drizzleDB.query.conceptImage.findFirst({
    where: eq(conceptImage.id, imageid || ""),
  });
  const url = image?.image;
  const width = url ? 576 : 512;
  const height = url ? 768 : 130;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontSize: 60,
        color: "black",
        background: "#f6f6f6",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {url ? (
        <img width={width} height={height} src={url} alt="Concept Art" />
      ) : (
        <img
          width={width}
          height={height}
          src="https://uploadthing.b-cdn.net/f/10b0df72-5e27-4785-92ad-a63996127c85-hzez4j.png"
          alt="Concept Art"
        />
      )}
    </div>,
    {
      width: width,
      height: height,
    },
  );
}
