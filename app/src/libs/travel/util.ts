import {
  Group,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  Vector3,
  BufferGeometry,
  CanvasTexture,
} from "three";
import { IMG_AVATAR_DEFAULT, IMG_SECTOR_USER_SPRITE_MASK } from "@/drizzle/constants";
import { loadTexture } from "@/libs/threejs/util";
import type { GlobalPoint } from "@/libs/travel/types";

/**
 * Create a user avatar sprite for the global map
 */
export const createUserAvatarSprite = (info: {
  userData: {
    userId: string;
    sector: number;
    avatar: string | null;
    avatarLight: string | null;
  };
  sector: GlobalPoint;
  showLine: boolean;
  borderColor: string;
  distance: number;
}) => {
  const { userData, sector, borderColor = "white", distance } = info;
  if (!userData) return new Group();

  const group = new Group();

  // Distance from the surface
  const d = 3 - distance;

  // Create the line connecting to the surface
  if (info.showLine) {
    const points = [];
    points.push(new Vector3(sector.x / 3, sector.y / 3, sector.z / 3));
    points.push(new Vector3(sector.x / d, sector.y / d, sector.z / d));
    const lineMaterial = new LineBasicMaterial({
      color: "#000000",
      linewidth: 1,
    });
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new LineSegments(geometry, lineMaterial);
    group.add(line);
  }

  // Create white circular border sprite
  const borderCanvas = document.createElement("canvas");
  const borderSize = 64; // Size in pixels
  borderCanvas.width = borderSize;
  borderCanvas.height = borderSize;
  const borderContext = borderCanvas.getContext("2d");

  if (borderContext) {
    // Clear the canvas
    borderContext.clearRect(0, 0, borderSize, borderSize);

    // Draw white circle border
    const centerX = borderSize / 2;
    const centerY = borderSize / 2;
    const radius = borderSize / 2 - 2; // Leave some padding for the border

    borderContext.beginPath();
    borderContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    borderContext.fillStyle = borderColor;
    borderContext.fill();
  }

  const borderTexture = new CanvasTexture(borderCanvas);
  borderTexture.generateMipmaps = false;
  borderTexture.minFilter = LinearFilter;

  const borderMaterial = new SpriteMaterial({
    map: borderTexture,
    depthWrite: false,
    depthTest: false,
  });
  const borderSprite = new Sprite(borderMaterial);
  borderSprite.scale.set(1.2, 1.2, 1.2); // Slightly larger than avatar
  borderSprite.position.set(sector.x / d, sector.y / d, sector.z / d);
  group.add(borderSprite);

  // User avatar sprite
  const alphaMap = loadTexture(IMG_SECTOR_USER_SPRITE_MASK);
  const avatar = userData?.avatarLight || userData?.avatar || IMG_AVATAR_DEFAULT;
  const avatarTexture = loadTexture(avatar);
  avatarTexture.generateMipmaps = false;
  avatarTexture.minFilter = LinearFilter;
  const avatarMaterial = new SpriteMaterial({
    map: avatarTexture,
    alphaMap: alphaMap,
    depthWrite: false,
    depthTest: false,
  });
  const avatarSprite = new Sprite(avatarMaterial);
  avatarSprite.scale.set(1, 1, 1);
  avatarSprite.position.set(sector.x / d, sector.y / d, sector.z / d);
  group.add(avatarSprite);

  return group;
};
