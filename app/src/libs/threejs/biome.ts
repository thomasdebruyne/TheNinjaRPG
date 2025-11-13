import {
  Vector3,
  MeshBasicMaterial,
  Sprite,
  SpriteMaterial,
  Group,
  RepeatWrapping,
  DoubleSide,
} from "three";
import { loadTexture } from "@/libs/threejs/util";
import { applyWindShader } from "@/libs/threejs/shaders";
import type { TerrainHex } from "../hexgrid";
import type { GlobalTile } from "@/libs/threejs/types";

/**
 * Map materials & colors
 */
export const groundColors = [0x48bd48, 0x37aa37, 0x239623] as const;

export const oceanColors = [0x184695, 0x1c54b5, 0x2767d7] as const;

export const dessertColors = [0xf9e79f, 0xfad7a0, 0xf5cba7] as const;

export const iceColors = [0x9febf7, 0x89cde0, 0x98dfe8] as const;

export const snowColors = [0xffffff, 0xeeeeee, 0xfefefe] as const;

export const groundMats = groundColors.map(
  (color) => new MeshBasicMaterial({ color, transparent: true }),
);

export const oceanMats = oceanColors.map((color) => {
  const waterTexture = loadTexture(
    "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJIo4wHixfOewksxBoS1HQCihpL7c42Ky9uUFv",
  );
  waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;
  waterTexture.repeat.set(1, 1);
  const waterMaterial = new MeshBasicMaterial({
    color,
    transparent: true,
    map: waterTexture,
  });
  return waterMaterial;
});

export const dessertMats = dessertColors.map(
  (color) => new MeshBasicMaterial({ color, transparent: true }),
);

export const iceMats = iceColors.map(
  (color) => new MeshBasicMaterial({ color, transparent: true }),
);

export const snowMats = snowColors.map(
  (color) => new MeshBasicMaterial({ color, transparent: true }),
);

/**
 * Returns materials and potential game assets to show on a given tile
 */
type TileType = "ocean" | "ground" | "dessert" | "ice";

interface TileInfo {
  material: MeshBasicMaterial;
  dirt: MeshBasicMaterial;
  sprites: Sprite[];
  asset: TileType;
}

export const getDirtMaterial = (tileType: TileType) => {
  const texture = loadTexture(
    "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJob2ojkZ9MPZpHJ7VliuEWDfATdxhv62SXnm4",
  );
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);
  return new MeshBasicMaterial({ map: texture, side: DoubleSide });
};

export const getTileInfo = (prng: () => number, hex: TerrainHex, tile: GlobalTile) => {
  const material = getMaterial(hex, tile);
  material.sprites = getMapSprites(prng, material.asset, hex);
  material.dirt = getDirtMaterial(material.asset);
  return material;
};

export const getMapSprites = (prng: () => number, asset: string, hex: TerrainHex) => {
  const sprites: Sprite[] = [];
  // Fetch tile sprite
  let cost = hex.cost;
  const rand = prng();
  let sprite = null;
  let assets = null;
  if (asset === "ground") {
    assets = GROUND_ASSETS_PROPS;
    cost += 1;
  } else if (asset === "dessert") {
    assets = DESSERT_ASSET_PROPS;
    cost += 1;
  } else if (asset === "ice") {
    assets = ICE_ASSET_PROPS;
    cost += 1;
  } else {
    assets = OCEAN_ASSET_PROPS;
    cost += 5;
  }
  const posibleAssets = assets?.filter((asset) => {
    return rand < asset.chance;
  });
  const sortedAssets = posibleAssets.sort((a, b) =>
    Math.abs(b.scale / 2 - hex.assetStrength + prng() / 10) <
    Math.abs(a.scale / 2 - hex.assetStrength + prng() / 10)
      ? 1
      : -1,
  );
  const selectedAsset = sortedAssets?.[0];
  if (selectedAsset) {
    const scale = selectedAsset?.scale || 1;
    const sizeVariation = selectedAsset?.scaleVariation || 0;
    const posVariation = selectedAsset?.posVariation || 0;
    const size = scale + sizeVariation * (prng() - 0.5);
    const { height: h, width: w } = hex;
    const { x, y } = hex.center;
    const posX = -x + w / 2 + w * posVariation * (prng() - 0.5);
    const posY = -y + (size * h) / 2 + 0.1 * h * size;
    sprite = loadSectorAsset(selectedAsset.filepath, rand, selectedAsset.windAffected);
    Object.assign(sprite.scale, new Vector3(size * h, size * h, 1));
    Object.assign(sprite.position, new Vector3(posX, posY, -8));
    sprites.push(sprite);
  }
  hex.cost = cost;
  // Sort so the ones with the highest y's are last
  sprites.sort((a, b) => a.position.y - b.position.y);
  // Return sprite
  return sprites;
};

const loadSectorAsset = (
  filepath: string,
  rand: number,
  windAffected?: boolean | null,
) => {
  const texture = loadTexture(filepath);
  const material = new SpriteMaterial({ map: texture });

  // Add wind effect via shader modification
  if (windAffected) {
    // Generate random offset for this specific sprite (0 to 2*PI)
    const randomOffset = rand * Math.PI * 2;
    applyWindShader(material, randomOffset);
  }

  const sprite = new Sprite(material);
  return sprite;
};

const getMaterial = (hex: TerrainHex, tile: GlobalTile) => {
  if (tile.t === 0) {
    if (hex.level < 0.3) {
      return { material: oceanMats[0], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.6) {
      return { material: oceanMats[1], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.8) {
      return { material: oceanMats[2], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.85) {
      return { material: dessertMats[0], asset: "dessert" } as TileInfo;
    } else if (hex.level < 0.9) {
      return { material: dessertMats[1], asset: "dessert" } as TileInfo;
    } else if (hex.level < 0.95) {
      return { material: dessertMats[2], asset: "dessert" } as TileInfo;
    } else {
      return { material: groundMats[2], asset: "ground" } as TileInfo;
    }
  } else if (tile.t === 1) {
    if (hex.level < 0.05) {
      return { material: oceanMats[0], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.1) {
      return { material: oceanMats[1], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.15) {
      return { material: oceanMats[2], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.2) {
      return { material: groundMats[2], asset: "ground" } as TileInfo;
    } else if (hex.level < 0.5) {
      return { material: groundMats[1], asset: "ground" } as TileInfo;
    } else if (hex.level < 0.8) {
      return { material: groundMats[0], asset: "ground" } as TileInfo;
    } else if (hex.level < 0.9) {
      return { material: dessertMats[0], asset: "dessert" } as TileInfo;
    } else if (hex.level < 0.95) {
      return { material: dessertMats[1], asset: "dessert" } as TileInfo;
    } else {
      return { material: dessertMats[2], asset: "dessert" } as TileInfo;
    }
  } else if (tile.t === 2) {
    if (hex.level < 0.05) {
      return { material: oceanMats[2], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.1) {
      return { material: groundMats[2], asset: "ground" } as TileInfo;
    } else if (hex.level < 0.3) {
      return { material: dessertMats[0], asset: "dessert" } as TileInfo;
    } else if (hex.level < 0.6) {
      return { material: dessertMats[1], asset: "dessert" } as TileInfo;
    } else {
      return { material: dessertMats[2], asset: "dessert" } as TileInfo;
    }
  } else {
    if (hex.level < 0.05) {
      return { material: oceanMats[2], asset: "ocean" } as TileInfo;
    } else if (hex.level < 0.3) {
      return { material: snowMats[0], asset: "ice" } as TileInfo;
    } else if (hex.level < 0.6) {
      return { material: snowMats[1], asset: "ice" } as TileInfo;
    } else {
      return { material: snowMats[2], asset: "ice" } as TileInfo;
    }
  }
};

export const getBackgroundColor = (tile: GlobalTile) => {
  if (tile.t === 0) {
    return { color: oceanColors[0] };
  } else if (tile.t === 1) {
    return { color: groundColors[1] };
  } else if (tile.t === 2) {
    return { color: dessertColors[2] };
  } else {
    return { color: iceColors[2] };
  }
};

export type AssetType = {
  filepath: string;
  chance: number;
  scale: number;
  scaleVariation?: number;
  posVariation?: number;
  windAffected?: boolean;
};

// Ground assets settings default
export const GROUND_ASSETS_PROPS: AssetType[] = [
  // Small assets
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJa55Vc5YYfKMcJ2B5EmWt6VsNgqxpG8OSXAQk",
    chance: 0.5,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJlvcZlIrWYxAsuC7ofQn9pM45OD0ERqkdBXJU",
    chance: 0.3,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJcpFFdRSnxBpQqGNDcTHbLmYz8uXAl3oa54ti",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJxfrF3oWZsq9k0Von5rUfP6OgQ2TyptCKHS4u",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: false,
  },
  // Green Trees
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJndYwvrmojJ0EqeDCvBrNmZaXVdY97gSpOWiA",
    chance: 0.7,
    scale: 2,
    scaleVariation: 0.7,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJvFn4sIEmSnXwslYEpV1yOeNL8gMtqhjPdf36",
    chance: 0.7,
    scale: 2,
    scaleVariation: 0.7,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJHl8NCiQvYURJhgs76VZtf9wxpMa13Cq0iOnr",
    chance: 0.5,
    scale: 2,
    scaleVariation: 0.7,
    posVariation: 0.25,
    windAffected: true,
  },
];

// Dessert assets settings default
export const DESSERT_ASSET_PROPS: AssetType[] = [
  // Cactus
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJe0aIBjyV3OvUJQExAi0bGoIZDF74LqSnHRdp",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJ7vgcu3XKPBOUWGyFuM4DlL1v5HNTZhkte0z6",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: true,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJvmatJJEmSnXwslYEpV1yOeNL8gMtqhjPdf36",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
    windAffected: true,
  },
  // Stones
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJQlUKaJVjhzBPya1rwfCIqOTU0cV5xgsMeo3u",
    chance: 0.2,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJzLLsgkemvaQu94EYJs8HpxVzofny6iPtbgCZ",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJylERmDukVH2MI5Lo4ehEfAXvZdcmtWqPg7rp",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
  },
];

// Dessert assets settings default
export const ICE_ASSET_PROPS: AssetType[] = [
  // Stones
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJzLLsgkemvaQu94EYJs8HpxVzofny6iPtbgCZ",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
  },
  {
    filepath:
      "https://ui0arpl8sm.ufs.sh/f/Hzww9EQvYURJylERmDukVH2MI5Lo4ehEfAXvZdcmtWqPg7rp",
    chance: 0.1,
    scale: 1,
    scaleVariation: 0.2,
    posVariation: 0.25,
  },
];

// Ocean assets settings default
export const OCEAN_ASSET_PROPS: AssetType[] = [];

/**
 * Generates wall placements forming a rectangular perimeter around the village
 * with a one-tile padding from the grid edges.
 *
 * @param sectorWidth - Width of the sector
 * @param sectorHeight - Height of the sector
 * @returns Array of {x, y} coordinates for wall placements
 */
export const generateWallPlacements = (sectorWidth: number, sectorHeight: number) => {
  const wallPlacements: Array<{ x: number; y: number }> = [];
  const padding = 1;

  // Define the boundaries with padding
  const minCol = padding;
  const maxCol = sectorWidth - padding - 1;
  const minRow = padding;
  const maxRow = sectorHeight - padding - 1;

  // Trace the rectangular perimeter
  // Top edge (left to right, excluding last corner)
  for (let col = minCol; col < maxCol; col++) {
    wallPlacements.push({ x: col, y: minRow });
  }

  // Right edge (top to bottom, excluding last corner)
  for (let row = minRow; row < maxRow; row++) {
    wallPlacements.push({ x: maxCol, y: row });
  }

  // Bottom edge (right to left, excluding last corner)
  for (let col = maxCol; col > minCol; col--) {
    wallPlacements.push({ x: col, y: maxRow });
  }

  // Left edge (bottom to top, closing the loop)
  for (let row = maxRow; row >= minRow; row--) {
    wallPlacements.push({ x: minCol, y: row });
  }

  return wallPlacements;
};
