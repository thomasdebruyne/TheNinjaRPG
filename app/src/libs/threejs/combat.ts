import {
  Color,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LinearFilter,
  Mesh,
  SpriteMaterial,
  Sprite,
  Texture,
  Line,
  type BufferGeometry,
} from "three";
import { loadTexture, createTexture } from "@/libs/threejs/util";
import { playPreloadedAudio } from "@/utils/audio";
import { getPossibleActionTiles, findHex, PathCalculator } from "../hexgrid";
import {
  COMBAT_BORDER_LEFT,
  COMBAT_BORDER_RIGHT,
  COMBAT_BORDER_TOP,
  COMBAT_BORDER_BOTTOM,
} from "@/libs/combat/constants";
import { getAffectedTiles } from "@/libs/combat/util";
import { actionPointsAfterAction } from "@/libs/combat/actions";
import { calcActiveUser } from "@/libs/combat/actions";
import { stillInBattle } from "@/libs/combat/actions";
import { getBattleGrid } from "@/libs/combat/util";
import { getTileInfo } from "@/libs/threejs/biome";
import { applyWaveShader } from "@/libs/threejs/shaders";
import {
  getHexPoints,
  calculateHexUVCoordinates,
  calculateTileOffset,
  createGroundCorners,
  createTileGeometry,
  createTileEdges,
  createGroundGeometry,
  createGroundEdges,
  mergeBufferGeometries,
} from "@/libs/threejs/hexgrid";
import { createNoise2D } from "simplex-noise";
import { Grid } from "honeycomb-grid";
import {
  IMG_SECTOR_USER_MARKER,
  IMG_SECTOR_USER_SPRITE_MASK,
  IMG_SECTOR_SHADOW,
  IMG_BATTLEFIELD_TOMBSTONE,
  IMG_BATTLEFIELD_STAR,
  HEX_STACKING_DISPLACEMENT,
} from "@/drizzle/constants";
import { ID_SFX_MOVE } from "@/drizzle/constants";
import type { GameAsset, UserData } from "@/drizzle/schema";
import type { Object3D } from "three";
import type { TerrainHex, HexagonalFaceMesh } from "../hexgrid";
import type { GroundEffect, UserEffect, BarrierTagType } from "@/libs/combat/types";
import type { ReturnedUserState, CombatAction } from "@/libs/combat/types";
import type { ReturnedBattle, CachedIntersections } from "@/libs/combat/types";
import type { SpriteMixer } from "@/libs/threejs/SpriteMixer";

// Drawing layers on the battlefield
const ASSETS_LAYER = -8;
const TILES_LAYER = -9;
const DIRT_LAYER = -10;

// Performance optimization: Cache status bar textures to avoid recreating canvases
// Key format: "width-height-color-stroke"
const statusBarTextureCache = new Map<string, Texture>();

/**
 * Show animation on the hex
 */
export const showAnimation = (
  animation: GameAsset,
  hex: TerrainHex,
  spriteMixer: SpriteMixer,
  playInfinite = false,
) => {
  const { height: h, width: w } = hex;
  const texture = loadTexture(animation.image);
  const actionSprite = spriteMixer.createActionSprite(texture, 1, animation.frames);
  const action = spriteMixer.createAction(
    actionSprite,
    0,
    animation.frames - 1,
    animation.speed,
  );
  if (action) {
    action.hideWhenFinished = true;
    if (playInfinite) {
      action.playLoop();
    } else {
      action.playOnce();
    }
  }
  actionSprite.scale.set(50, 50, 1);
  actionSprite.position.set(w / 2, h / 2, 5);
  return actionSprite;
};

/**
 * Creates hexagonal grid & draw it using js. Return groups of objects drawn
 * Similar to drawSector but for combat, with expanded border for assets
 */
export const drawCombatBackground = (
  width: number,
  battle: ReturnedBattle,
  prng: () => number,
  lightLayout = false,
) => {
  // Calculate hex size
  const hexsize =
    width / (battle.width - HEX_STACKING_DISPLACEMENT * (battle.width - 1));

  // Used for procedural map generation
  const noiseGen = createNoise2D(prng);
  const assetsGen = createNoise2D(prng);

  // Groups for organizing objects
  const group_dirt = new Group();
  const group_tiles = new Group();
  const group_edges = new Group();
  const group_names = new Group();
  const group_assets = new Group();

  // Create single grid with border included
  const honeycombGrid = getBattleGrid(hexsize, battle, {
    x: -hexsize * 0.5,
    y: -hexsize * 0.5,
  }).map((tile) => {
    // Set noise-based level using grid coordinates
    const nx = tile.col / battle.width - 0.5;
    const ny = tile.row / battle.height - 0.5;
    tile.level = noiseGen(nx, ny) / 2 + 0.5;
    tile.assetStrength = assetsGen(nx, ny) / 2 + 0.5;
    return tile;
  });

  // Get hex points for geometry construction
  const { points, groundPoints, groundEdges } = getHexPoints();

  // Calculate UV coordinates once using first tile
  const firstTile = honeycombGrid.toArray()[0];
  const { groundUVArray, tileUVArray } = calculateHexUVCoordinates(
    firstTile,
    points,
    groundPoints,
  );

  // Line material to use for edges
  const lineMaterial = new LineBasicMaterial({ color: 0x555555 });

  // Arrays to collect geometries for merging (major performance optimization)
  const groundGeometries: BufferGeometry[] = [];
  const groundEdgeGeometries: BufferGeometry[] = [];

  // Draw the tiles
  honeycombGrid.forEach((tile) => {
    if (tile) {
      // Determine if this is a battle tile (playable area) or border tile
      const isBattleTile =
        tile.col >= COMBAT_BORDER_LEFT &&
        tile.col < battle.width - COMBAT_BORDER_RIGHT &&
        tile.row >= COMBAT_BORDER_BOTTOM &&
        tile.row < battle.height - COMBAT_BORDER_TOP;

      // Get tile info (material, dirt, sprites)
      const { material, dirt, sprites, asset } = getTileInfo(
        prng,
        tile,
        battle.background,
        lightLayout,
      );
      tile.asset = asset;

      // Add sprites to border tiles, or to battle tiles if they're marked as small
      if (sprites && sprites.length > 0 && !lightLayout) {
        sprites.forEach((sprite) => {
          const isSmall = sprite.userData.small === true;
          if (!isBattleTile || isSmall) {
            sprite.matrixAutoUpdate = false;
            sprite.updateMatrix();
            group_assets.add(sprite);
          }
        });
      }

      // Corners of the tile
      const corners = tile.corners;

      // Calculate offset for ocean tiles (they are displaced down for depth effect)
      const { length, offsetLength, offsetLayer } = calculateTileOffset(
        corners,
        asset,
        lightLayout,
      );

      // Create the corners of the ground below
      const groundCorners = createGroundCorners(corners, offsetLength, length);

      // Top face of the tile
      const geometry = createTileGeometry({
        corners,
        points,
        tileUVArray,
        offsetLength,
        offsetLayer,
        layer: TILES_LAYER,
      });

      const clonedMaterial = material?.clone();

      // Apply wave shader to ocean tiles
      if (asset === "ocean" && clonedMaterial) {
        const randomOffset = Math.random() * Math.PI * 2;
        applyWaveShader(clonedMaterial, randomOffset);
      }

      const mesh = new Mesh(geometry, clonedMaterial);

      // For battle tiles, use battle grid coordinates; for border tiles use expanded coordinates
      mesh.name = `${tile.row},${tile.col}`;
      mesh.userData.type = "tile";
      mesh.userData.tile = tile;
      mesh.userData.originalColor = clonedMaterial?.color.clone();
      mesh.userData.highlight = false;
      mesh.userData.selected = false;
      mesh.userData.canClick = isBattleTile; // Only battle tiles are clickable
      mesh.userData.isBattleTile = isBattleTile;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      group_tiles.add(mesh);

      // Edges on the top face
      const edgeMesh = createTileEdges(geometry, lineMaterial);
      edgeMesh.updateMatrix();
      group_edges.add(edgeMesh);

      // Ground part of the tile
      if (!lightLayout) {
        const groundGeometry = createGroundGeometry({
          groundCorners,
          groundPoints,
          groundUVArray,
          layer: DIRT_LAYER,
        });

        // Instead of creating individual meshes, collect geometries for merging
        groundGeometries.push(groundGeometry);

        // Collect edge geometries
        const edgeMeshes = createGroundEdges({
          groundCorners,
          groundEdges,
          lineMaterial,
          layer: DIRT_LAYER,
        });
        edgeMeshes.forEach((edgeMesh) => {
          if (edgeMesh.geometry) {
            groundEdgeGeometries.push(edgeMesh.geometry);
          }
        });
      }

      // Draw tile name for battle grid tiles
      if (isBattleTile && tile.name) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const fontSize = 18;
          const text = tile.name;
          ctx.font = `${fontSize}px Arial`;
          const textWidth = ctx.measureText(text).width;

          canvas.width = Math.ceil(textWidth + 12);
          canvas.height = Math.ceil(fontSize + 10);

          ctx.font = `${fontSize}px arial narrow`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = "white";
          ctx.lineWidth = 4;

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          ctx.fillText(text, cx, cy);

          const texture = createTexture(canvas);
          texture.needsUpdate = true;
          const spriteMaterial = new SpriteMaterial({
            map: texture,
          });
          const sprite = new Sprite(spriteMaterial);

          sprite.position.set(tile.x, tile.y - (2 * cy) / 3, ASSETS_LAYER);

          const scale = (Math.max(tile.height, tile.width) * 0.2) / fontSize;
          sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);

          // Performance optimization: Static name sprites never move
          sprite.matrixAutoUpdate = false;
          sprite.updateMatrix();

          group_names.add(sprite);
        }
      }
    }
  });

  // Merge all ground geometries into a single mesh (huge performance gain)
  if (!lightLayout && groundGeometries.length > 0) {
    const mergedGroundGeometry = mergeBufferGeometries(groundGeometries);
    // Use the first tile's dirt material
    const firstTile = honeycombGrid.toArray()[0];
    if (firstTile) {
      const { dirt } = getTileInfo(prng, firstTile, battle.background, lightLayout);
      const mergedGroundMesh = new Mesh(mergedGroundGeometry, dirt);
      mergedGroundMesh.userData.type = "ground_merged";
      mergedGroundMesh.matrixAutoUpdate = false;
      mergedGroundMesh.updateMatrix();
      group_dirt.add(mergedGroundMesh);
    }

    // Merge all ground edge geometries into a single line mesh
    if (groundEdgeGeometries.length > 0) {
      const mergedEdgeGeometry = mergeBufferGeometries(groundEdgeGeometries);
      const mergedEdgeMesh = new Line(mergedEdgeGeometry, lineMaterial);
      mergedEdgeMesh.matrixAutoUpdate = false;
      mergedEdgeMesh.updateMatrix();
      group_dirt.add(mergedEdgeMesh);
    }
  }

  // Sort assets by position (one-time during scene setup)
  group_assets.children.sort((a, b) => b.position.y - a.position.y);

  return {
    group_dirt,
    group_tiles,
    group_edges,
    group_names,
    group_assets,
    honeycombGrid,
  };
};

/**
 * Draw/update the users on the map. Should be called on every render
 */
export const drawCombatEffects = (info: {
  groupEffects: Group;
  battle: ReturnedBattle;
  grid: Grid<TerrainHex>;
  animationId: number;
  spriteMixer: SpriteMixer;
  gameAssets: GameAsset[];
  sfxEnabled?: boolean;
  sfxVolume?: number;
}) => {
  // Destructure
  const { battle, groupEffects, spriteMixer, animationId, gameAssets } = info;
  const { groundEffects, usersEffects, usersState } = battle;

  // Record of drawn IDs
  const drawnIds = new Set<string>();

  // Draw the ground effects
  groundEffects.forEach((effect) => {
    const hex = findHex(info.grid, {
      x: effect.longitude,
      y: effect.latitude,
    });
    drawCombatEffect({
      groupEffects,
      effect,
      animationId,
      hex,
      spriteMixer,
      drawnIds,
      gameAssets,
      sfxEnabled: info.sfxEnabled,
      sfxVolume: info.sfxVolume,
    });
  });
  // Draw all user effects
  usersEffects.forEach((effect) => {
    const user = usersState.find((u) => u.userId === effect.targetId);
    if (user && stillInBattle(user)) {
      const hex = findHex(info.grid, {
        x: user.longitude,
        y: user.latitude,
      });
      drawCombatEffect({
        groupEffects,
        effect,
        animationId,
        hex,
        spriteMixer,
        drawnIds,
        gameAssets,
        sfxEnabled: info.sfxEnabled,
        sfxVolume: info.sfxVolume,
      });
    }
  });

  // Hide all which are not used anymore
  groupEffects.children.forEach((object) => {
    if (!drawnIds.has(object.name)) {
      object.visible = false;
    }
  });
};

export const drawCombatEffect = (info: {
  groupEffects: Group;
  effect: GroundEffect | UserEffect;
  animationId: number;
  hex?: TerrainHex;
  spriteMixer: SpriteMixer;
  drawnIds: Set<string>;
  gameAssets: GameAsset[];
  sfxEnabled?: boolean;
  sfxVolume?: number;
}) => {
  // Destructure
  const { effect, groupEffects, animationId, hex, drawnIds } = info;
  const { spriteMixer, gameAssets } = info;
  if (hex) {
    if (
      effect.staticAssetPath ||
      effect.staticAnimation ||
      effect.appearAnimation ||
      effect.disappearAnimation ||
      effect.appearSfx ||
      effect.disappearSfx
    ) {
      const { height: h, width: w } = hex;
      let asset = groupEffects.getObjectByName(effect.id) as Group;
      if (!asset) {
        // Group for the asset
        asset = new Group();
        asset.name = effect.id;
        asset.userData.type = effect.type; // e.g. "barrier"
        // Sprite to show
        if (effect.staticAssetPath) {
          const obj = gameAssets.find((a) => a.id === effect.staticAssetPath);
          if (obj) {
            const texture = loadTexture(obj.image);
            const material = new SpriteMaterial({ map: texture });
            const sprite = new Sprite(material);
            sprite.scale.set(w, h, 1);
            sprite.position.set(w / 2, h / 2, 0);
            asset.add(sprite);
          }
        }
        // If there is an appear animation, show it. Mark it for hiding,
        // which we catch and use to remove it
        if (effect.appearAnimation && animationId !== 0) {
          const obj = gameAssets.find((a) => a.id === effect.appearAnimation);
          if (obj) {
            const actionSprite = showAnimation(obj, hex, spriteMixer);
            if (actionSprite) asset.add(actionSprite);
          }
        }
        // If there is an appear SFX, play it once
        if (effect.appearSfx && animationId !== 0 && info.sfxEnabled) {
          try {
            const sfx = gameAssets.find((a) => a.id === effect.appearSfx);
            const url = sfx?.url;
            if (url) {
              void playPreloadedAudio(url, info.sfxVolume);
            }
          } catch {}
        }
        // If there is a static animation, show it.
        if (effect.staticAnimation) {
          const obj = gameAssets.find((a) => a.id === effect.staticAnimation);
          if (obj) {
            const actionSprite = showAnimation(obj, hex, spriteMixer, true);
            if (actionSprite) asset.add(actionSprite);
          }
        }
        // Status bar
        if (effect.type === "barrier") {
          const hp_background = drawStatusBar(w, h, "gray", true, "hp_background", 0);
          const hp_bar = drawStatusBar(w, h, "firebrick", true, "hp_current", 0);
          asset.add(hp_background);
          asset.add(hp_bar);
          hp_bar.position.set(w / 2, h, 0);
          hp_background.position.set(w / 2, h, 0);
          hp_bar.visible = false;
          hp_background.visible = false;
        }
        // Add to group
        groupEffects.add(asset);
      }

      // Set visibility
      if (asset) {
        if (effect.power !== undefined && effect.power <= 0) {
          asset.visible = false;
          // Play disappear SFX when hiding
          if (effect.disappearSfx && info.sfxEnabled && animationId !== 0) {
            try {
              const sfx = gameAssets.find((a) => a.id === effect.disappearSfx);
              const url = sfx?.url;
              if (url) {
                void playPreloadedAudio(url, info.sfxVolume);
              }
            } catch {}
          }
        } else {
          asset.visible = true;
          asset.userData.tile = hex;
          const { x, y } = hex.center;
          asset.position.set(-x, -y, -8);
          drawnIds.add(asset.name);
        }
      }
    }
  }
};

/**
 * Draw a status bar on user
 * Performance optimization: Uses texture cache to avoid recreating canvases
 */
export const drawStatusBar = (
  w: number,
  h: number,
  color: string,
  stroke: boolean,
  name: string,
  yOffset: number,
) => {
  const r = 3;
  const canvasWidth = r * w;
  const canvasHeight = (r * h) / 10;

  // Create cache key for this specific status bar configuration
  const cacheKey = `${canvasWidth}-${canvasHeight}-${color}-${stroke}`;

  // Check if we already have a cached texture for this configuration
  let texture = statusBarTextureCache.get(cacheKey);

  if (!texture) {
    // Create new canvas and texture if not cached
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = color;
      // Scale line width proportionally to canvas size, but keep reasonable bounds
      const lineWidth = Math.max(1, Math.min(4, canvasHeight / 6));
      context.lineWidth = lineWidth;
      context.strokeStyle = "black";
      if (stroke) {
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeRect(0, 0, canvas.width, canvas.height);
      } else {
        const padding = lineWidth / 2;
        context.fillRect(
          padding,
          padding,
          canvas.width - 2 * padding,
          canvas.height - 2 * padding,
        );
      }
    }
    texture = createTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.needsUpdate = true;

    // Cache the texture for reuse
    statusBarTextureCache.set(cacheKey, texture);
  }

  const bar_material = new SpriteMaterial({ map: texture });
  const bar_sprite = new Sprite(bar_material);
  bar_sprite.position.set(w / 2, h * 1.58 - (yOffset * (canvasHeight - 2)) / r, -5);
  bar_sprite.scale.set(canvasWidth / r, canvasHeight / r, 1);
  bar_sprite.name = name;
  bar_sprite.userData.full_width = w;
  bar_sprite.userData.previousValue = undefined; // Track previous value for change detection
  bar_sprite.visible = false;
  return bar_sprite;
};

/**
 * Update status bar of a user sprite
 * Performance optimization: Only updates if value changed (dirty flag system)
 */
export const updateStatusBar = (name: string, userSpriteGroup: Group, perc: number) => {
  const bar = userSpriteGroup.getObjectByName(name);
  if (bar) {
    // Check if value actually changed (dirty flag optimization)
    const previousValue = bar.userData.previousValue as number | undefined;
    if (previousValue !== undefined && Math.abs(previousValue - perc) < 0.001) {
      // Value hasn't changed significantly, skip update
      return;
    }

    // Store current value for next frame comparison
    bar.userData.previousValue = perc;

    // Perform the actual update
    const width = bar.userData.full_width as number;
    const newWidth = width * perc;
    const newPosition = width / 2 - (width * (1 - perc)) / 2;
    bar.scale.set(newWidth, bar.scale.y, 1);
    bar.position.set(newPosition, bar.position.y, bar.position.z);
    if (perc === 0) {
      bar.visible = false;
    }
  }
};

/**
 * User sprite, which loads the avatar image and displays the health bar as a js sprite
 */
export const createUserSprite = (
  userData: ReturnedUserState,
  hex: TerrainHex,
  playerId: string | undefined,
) => {
  // If not there, nope
  if (userData.curHealth <= 0 || userData.fledBattle) return undefined;

  // Group is used to group components of the user Marker
  const group = new Group();
  const { height: h, width: w } = hex;

  // Shadow
  const texture = loadTexture(IMG_SECTOR_SHADOW);
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  const shadow_material = new SpriteMaterial({ map: texture });
  const shadow_sprite = new Sprite(shadow_material);
  shadow_sprite.scale.set(w * 0.7, h * 0.4, 1);
  shadow_sprite.position.set(w / 2, h * 0.3, -6);
  group.add(shadow_sprite);

  // User marker background or raw image
  const noMarker = userData.isAi && userData.isOriginal;
  if (noMarker) {
    const map = loadTexture(userData.avatar ? `${userData.avatar}?1=1` : "");
    map.generateMipmaps = false;
    map.minFilter = LinearFilter;
    if (userData.direction === "right") {
      map.repeat.set(-1, 1);
      map.offset.set(1, 0);
    }
    const material = new SpriteMaterial({ map: map });
    material.side = DoubleSide;
    const sprite = new Sprite(material);
    sprite.scale.set(-1 * h * 0.8, h * 0.8, 1);
    sprite.position.set(w / 2, h * 0.6, -6);
    group.add(sprite);
    // Star on summons
    if (userData.isSummon && userData.controllerId === playerId) {
      const marker = loadTexture(IMG_BATTLEFIELD_STAR);
      const markerMat = new SpriteMaterial({ map: marker });
      const markerSprite = new Sprite(markerMat);
      markerSprite.scale.set(h / 2.5, h / 2.5, 1);
      markerSprite.position.set(w / 2, h * 0.2, -6);
      group.add(markerSprite);
    }
  } else {
    // Highlight background in village color
    const highlightTexture = loadTexture(IMG_SECTOR_USER_MARKER);
    const highlightMaterial = new SpriteMaterial({
      map: highlightTexture,
      alphaMap: highlightTexture,
    });

    // Highlight sprite
    const highlightColor = userData.village
      ? parseInt(userData.village.hexColor.replace("#", ""), 16)
      : 0x000000;
    const highlightSprite = new Sprite(highlightMaterial);
    highlightSprite.userData.type = "marker";
    highlightSprite.scale.set(h, h * 1.2, 1);
    highlightSprite.position.set(w / 2, h * 0.9, -6);
    highlightSprite.userData.type = "userMarker";
    highlightSprite.userData.userId = userData.userId;
    highlightSprite.material.color.setHex(highlightColor);
    group.add(highlightSprite);

    // Marker background in white
    const marker = loadTexture(IMG_SECTOR_USER_MARKER);
    const markerMat = new SpriteMaterial({ map: marker, alphaMap: marker });
    const markerSprite = new Sprite(markerMat);
    markerSprite.userData.type = "marker";
    markerSprite.scale.set(0.9 * h, h * 1.1, 1);
    markerSprite.position.set(w / 2, h * 0.9, -6);
    group.add(markerSprite);

    // Avatar Sprite
    const alphaMap = loadTexture(IMG_SECTOR_USER_SPRITE_MASK);
    const map = loadTexture(userData.avatar ? `${userData.avatar}?1=1` : "");
    map.generateMipmaps = false;
    map.minFilter = LinearFilter;
    const material = new SpriteMaterial({ map: map, alphaMap: alphaMap });
    const sprite = new Sprite(material);
    sprite.scale.set(h * 0.8, h * 0.8, 1);
    sprite.position.set(w / 2, h * 1.0, -6);
    group.add(sprite);

    // Clan if it is there
    if (userData.clan?.image) {
      const clanTexture = loadTexture(userData.clan.image);
      const clanBorderMaterial = new SpriteMaterial({
        map: alphaMap,
        alphaMap: alphaMap,
      });
      const clanBorderSprite = new Sprite(clanBorderMaterial);
      clanBorderSprite.material.color.setHex(parseInt("FFD700", 16));
      clanBorderSprite.scale.set(-1 * h * 0.3 - 2, h * 0.3 + 2, 1);
      clanBorderSprite.position.set(0.9 * w, h * 1.4, -6);
      group.add(clanBorderSprite);
      const clanMaterial = new SpriteMaterial({ map: clanTexture, alphaMap: alphaMap });
      const clanSprite = new Sprite(clanMaterial);
      clanSprite.scale.set(-1 * h * 0.3, h * 0.3, 1);
      clanSprite.position.set(0.9 * w, h * 1.4, -6);
      group.add(clanSprite);
    }
  }

  // If this is the original and our user (we have SP/CP), then show a star
  if ("curStamina" in userData && userData.isOriginal && !userData.isAi) {
    const marker = loadTexture(IMG_BATTLEFIELD_STAR);
    const markerMat = new SpriteMaterial({ map: marker });
    const markerSprite = new Sprite(markerMat);
    markerSprite.scale.set(h / 2.5, h / 2.5, 1);
    markerSprite.position.set(w / 2, h * 0.4, -6);
    group.add(markerSprite);
  }

  // Health bar is shown on all
  const t = noMarker ? h / 8 : 0;
  const hp_background = drawStatusBar(w, h, "gray", true, "hp_background", t);
  const hp_bar = drawStatusBar(w, h, "firebrick", true, "hp_current", t);
  group.add(hp_background);
  group.add(hp_bar);

  // Stamina Bar if available
  if ("curStamina" in userData && "maxStamina" in userData) {
    const sp_background = drawStatusBar(w, h, "gray", true, "sp_background", t + 1);
    const sp_bar = drawStatusBar(w, h, "green", true, "sp_current", t + 1);
    group.add(sp_background);
    group.add(sp_bar);
  }

  // Chakra Bar if available
  if ("curChakra" in userData && "maxChakra" in userData) {
    const cp_background = drawStatusBar(w, h, "gray", true, "cp_background", t + 2);
    const cp_bar = drawStatusBar(w, h, "blue", true, "cp_current", t + 2);
    group.add(cp_background);
    group.add(cp_bar);
  }

  // Create tombstone but hide it for now
  const tomb_texture = loadTexture(IMG_BATTLEFIELD_TOMBSTONE);
  const tomb_material = new SpriteMaterial({ map: tomb_texture });
  const tomb_sprite = new Sprite(tomb_material);
  tomb_sprite.name = "tombstone";
  tomb_sprite.scale.set(h * 0.5, h * 0.5, 1);
  tomb_sprite.position.set(w / 2, h * 0.6, -7);
  tomb_sprite.visible = false;
  group.add(tomb_sprite);

  // Name
  group.name = userData.userId;
  group.userData.type = "user";
  group.userData.userId = userData.userId;
  group.userData.hex = hex;

  return group;
};

/**
 * Sets the opacity of all children of an object
 */
export const setOpacity = (obj: Object3D | Group | Sprite, opacity: number) => {
  obj?.children.forEach((child) => {
    setOpacity(child, opacity);
  });
  if (obj && "material" in obj && obj?.material) {
    obj.material.opacity = opacity;
  }
};

/**
 * Sets the opacity of all children of an object
 */
export const setVisible = (obj: Object3D | Group | Sprite, visible: boolean) => {
  obj?.children.forEach((child) => {
    setVisible(child, visible);
  });
  if ("visible" in obj) {
    obj.visible = visible;
  }
};

// Track current tile (visual) and target tile (logical)
type MovementState = { path?: TerrainHex[]; index: number };
type UserMeshData = {
  hex?: TerrainHex;
  targetHex?: TerrainHex;
  movement?: MovementState;
  initialized?: boolean;
};
type GroupUsersData = {
  pathFinder?: PathCalculator;
  needsSort?: boolean;
};

/** Returns a cached PathCalculator on the users group, creating it if missing */
const getOrCreatePathFinder = (
  group_users: Group,
  grid: Grid<TerrainHex>,
): PathCalculator => {
  const data = (group_users.userData as GroupUsersData) ?? {};
  let ensured = data.pathFinder;
  if (!ensured) {
    ensured = new PathCalculator(grid);
    data.pathFinder = ensured;
    (group_users as unknown as { userData: GroupUsersData }).userData = data;
  }
  return ensured;
};

/** Marks the group as needing a sort on the next render */
const markGroupNeedsSort = (group: Group) => {
  const data = (group.userData as GroupUsersData) ?? {};
  data.needsSort = true;
  (group as unknown as { userData: GroupUsersData }).userData = data;
};

/** Ensures meshData exists and initializes current visual tile/position when first seen */
const getOrInitUserMeshData = (
  userMesh: Group,
  targetTile: TerrainHex,
): UserMeshData => {
  const meshData = (userMesh.userData as UserMeshData) ?? ({} as UserMeshData);
  if (!meshData.initialized) {
    meshData.hex = meshData.hex ?? targetTile;
    const { x, y } = targetTile.center;
    userMesh.position.set(-x, -y, 0);
    meshData.initialized = true;
  }
  meshData.movement = meshData.movement || { path: undefined, index: 0 };
  return meshData;
};

/** Computes a new path if target changed or path exhausted; updates meshData.targetHex */
const computePathIfNeeded = (
  meshData: UserMeshData,
  pathFinder: PathCalculator,
  targetTile: TerrainHex,
) => {
  const prevTarget = meshData.targetHex;
  const targetChanged =
    !prevTarget ||
    prevTarget.col !== targetTile.col ||
    prevTarget.row !== targetTile.row;
  const needNewPath =
    targetChanged ||
    !meshData.movement?.path ||
    (meshData.movement?.index ?? 0) >= (meshData.movement?.path?.length ?? 0);
  if (needNewPath) {
    const start: TerrainHex = meshData.hex ?? targetTile;
    const path = pathFinder.getShortestPath(start, targetTile) || [];
    const trimmed =
      path.length > 0 &&
      path[0] &&
      path[0].col === start.col &&
      path[0].row === start.row
        ? path.slice(1)
        : path;
    meshData.movement = { path: trimmed, index: 0 };
  }
  meshData.targetHex = targetTile;
};

/** Returns the per-frame movement speed for a tile */
const getTileSpeed = (tile: TerrainHex): number => {
  return (tile.width / 50) * 5; // tripled speed
};

/** Steps the mesh along its path or directly to target with clamped constant speed */
const stepAlongPath = (
  userMesh: Group,
  meshData: UserMeshData,
  targetTile: TerrainHex,
  speed: number,
  parentGroup: Group,
  onTileStep?: () => void,
) => {
  const { x: curX, y: curY } = userMesh.position;
  const moveTowards = (tx: number, ty: number, maxStep: number) => {
    const dx = tx - curX;
    const dy = ty - curY;
    const dist = Math.hypot(dx, dy);
    if (dist <= maxStep || dist === 0) {
      userMesh.position.set(tx, ty, 0);
      return true;
    } else {
      const nx = dx / dist;
      const ny = dy / dist;
      userMesh.position.set(curX + nx * maxStep, curY + ny * maxStep, 0);
      return false;
    }
  };

  // Easing function for speed multiplier: 0 at ends, 1 in middle. Clamp to a minimum to avoid stall
  const easedMultiplier = (progress: number, min = 0.35) => {
    const p = Math.max(0, Math.min(1, progress));
    const s = Math.sin(Math.PI * p);
    return Math.max(min, s);
  };

  const path = meshData.movement?.path;
  let index = meshData.movement?.index ?? 0;
  if (path && index < path.length) {
    const nextTile = path[index]!;
    const { x, y } = nextTile.center;
    // Compute progress along current segment for easing
    const startCenter = meshData.hex?.center ?? nextTile.center;
    const totalDist = Math.hypot((startCenter?.x ?? 0) - x, (startCenter?.y ?? 0) - y);
    const remaining = Math.hypot(-x - curX, -y - curY);
    const progress = totalDist > 0 ? 1 - remaining / totalDist : 1;
    const step = speed * easedMultiplier(progress);
    const reached = moveTowards(-x, -y, step);
    if (reached) {
      meshData.hex = nextTile;
      index += 1;
      meshData.movement = { path, index };
      if (onTileStep) onTileStep();
      markGroupNeedsSort(parentGroup);
      if (!path || index >= path.length) {
        const { x: tx, y: ty } = targetTile.center;
        userMesh.position.set(-tx, -ty, 0);
        meshData.hex = targetTile;
        meshData.movement = { path: undefined, index: 0 };
      }
    }
  } else {
    const { x, y } = targetTile.center;
    const startCenter = meshData.hex?.center ?? targetTile.center;
    const totalDist = Math.hypot((startCenter?.x ?? 0) - x, (startCenter?.y ?? 0) - y);
    const remaining = Math.hypot(-x - curX, -y - curY);
    const progress = totalDist > 0 ? 1 - remaining / totalDist : 1;
    const step = speed * easedMultiplier(progress);
    const reached = moveTowards(-x, -y, step);
    if (reached) {
      const previousHex = meshData.hex;
      meshData.hex = targetTile;
      if (parentGroup && previousHex !== targetTile) {
        markGroupNeedsSort(parentGroup);
      }
    }
  }
};

/**
 * Draw/update the users on the map. Should be called on every render
 */
export const drawCombatUsers = (info: {
  group_users: Group;
  users: ReturnedUserState[];
  grid: Grid<TerrainHex>;
  playerId: string | undefined;
  userData: UserData;
  sfxEnabled?: boolean;
  sfxVolume?: number;
  gameAssets?: GameAsset[];
}) => {
  // Destruct
  const { users, group_users, grid, playerId, userData } = info;
  // Cache or create a pathfinder for this group
  const pathFinder = getOrCreatePathFinder(group_users, grid);
  // Draw the users
  const drawnIds = new Set<string>();
  users.forEach((user) => {
    const hex = findHex(grid, {
      x: user.longitude,
      y: user.latitude,
    });
    if (hex) {
      // Fetch / create the user mesh
      let userMesh = group_users.getObjectByName(user.userId) as Group | undefined;
      if (!userMesh && hex) {
        // Always unhide current user
        if (user.userId === userData.userId) {
          user.avatar = userData.avatar;
          user.avatarLight = userData.avatarLight;
          user.username = userData.username;
        }
        userMesh = createUserSprite(user, hex, playerId);
        if (userMesh) {
          group_users.add(userMesh);
          markGroupNeedsSort(group_users);
        }
      }
      // Get location
      if (userMesh && grid) {
        userMesh.visible = true;

        const targetTile: TerrainHex = hex;
        const meshData = getOrInitUserMeshData(userMesh, targetTile);
        computePathIfNeeded(meshData, pathFinder, targetTile);
        const speed = getTileSpeed(meshData.hex ?? targetTile);
        const onTileStep = () => {
          if (info.sfxEnabled) {
            try {
              const assets = info.gameAssets ?? [];
              const sfx = assets.find((a) => a.id === ID_SFX_MOVE);
              const url = sfx?.url;
              if (url) void playPreloadedAudio(url, (info.sfxVolume ?? 0.8) * 0.75);
            } catch {}
          }
        };
        stepAlongPath(userMesh, meshData, targetTile, speed, group_users, onTileStep);
        userMesh.userData = meshData;
        // Handle remove users from combat.
        if (!stillInBattle(user) && user.hidden === undefined) {
          setVisible(userMesh, false);
          if (user.isOriginal) {
            const tombstone = userMesh.getObjectByName("tombstone") as Sprite;
            tombstone.visible = true;
          }
          user.hidden = true;
        }
        // userMesh.material.color.offsetHSL(0, 0, 0.1);
        updateStatusBar("hp_current", userMesh, user.curHealth / user.maxHealth);
        if (user.curStamina && user.maxStamina) {
          updateStatusBar("sp_current", userMesh, user.curStamina / user.maxStamina);
        }
        if (user.curChakra && user.maxChakra) {
          updateStatusBar("cp_current", userMesh, user.curChakra / user.maxChakra);
        }

        drawnIds.add(userMesh.name);
      }
    }
  });

  // Only sort when a user has moved to a new tile (not during interpolation)
  // This optimization prevents O(n log n) sorting every frame (~60fps)
  const groupData = group_users.userData as GroupUsersData;
  if (groupData?.needsSort) {
    group_users.children.sort((a, b) => b.position.y - a.position.y);
    group_users.children.forEach((child, index) => {
      child.renderOrder = index;
    });
    groupData.needsSort = false;
  }

  // Hide all user counters which are not used anymore
  group_users.children.forEach((object) => {
    if (!drawnIds.has(object.name)) {
      object.visible = false;
    }
  });
};

/**
 * Highlight possible squares based on action
 * Uses cached intersections to avoid redundant raycasting
 */
export const highlightTiles = (info: {
  group_tiles: Group;
  cachedIntersections: CachedIntersections;
  user: ReturnedUserState;
  timeDiff: number;
  action: CombatAction | undefined;
  battle: ReturnedBattle;
  grid: Grid<TerrainHex>;
  currentHighlights: Set<string>;
  precomputedActions?: CombatAction[];
}) => {
  // Definitions
  const { group_tiles, user, battle, currentHighlights, action, grid, timeDiff } = info;
  const battleTileIntersects = info.cachedIntersections.battleTiles;
  const hit = battleTileIntersects.length > 0 && battleTileIntersects[0];
  const users = battle.usersState;
  const origin = user && grid.getHex({ col: user.longitude, row: user.latitude });

  // Make sure the proper round & activeUser is shown when we draw combat
  const { actor } = calcActiveUser(battle, user.userId, timeDiff, {
    precomputedUserId: user.userId,
    precomputedActions: info.precomputedActions,
  });

  // Check if we have enough action points to perform action
  const { canAct } = actionPointsAfterAction(user, battle, action);
  const canUseTile = actor.userId === user.userId && canAct;

  // Highlight fields on the map where action can be applied
  const newHighlights = new Set<string>();
  const highlights = getPossibleActionTiles(action, origin, grid);

  if (highlights && canUseTile) {
    highlights.forEach((tile) => {
      if (tile) {
        const mesh = group_tiles.getObjectByName(
          `${tile.row},${tile.col}`,
        ) as HexagonalFaceMesh;
        if (mesh && mesh.userData.isBattleTile) {
          mesh.userData.highlight = true;
          newHighlights.add(mesh.name);
        }
      }
    });
  }

  // Check if cooldown for action has expired
  const isAvailable =
    !action?.cooldown ||
    !action?.lastUsedRound ||
    battle.round - action.lastUsedRound >= action.cooldown;

  // Is this a move action (if so, we color the selected green tile blue instead)
  const hasMove = action?.effects?.find((e) => e.type === "move");

  // Highlight intersected tile
  /* ************************** */
  const newSelection = new Set<string>();
  if (action && origin && highlights && hit && canUseTile && isAvailable) {
    const intersected = hit.object as HexagonalFaceMesh;
    const targetTile = intersected.userData.tile;
    // Based on the intersected tile, highlight the tiles which are affected.
    const { green, red } = getAffectedTiles({
      a: origin,
      b: targetTile,
      action,
      grid: grid,
      restrictGrid: highlights,
      ground: battle.groundEffects,
      userId: user.userId,
      users,
    });
    // Is the target in the highlights?
    const isAvailable =
      highlights.filter((h) => h === targetTile).size > 0 && !red.has(targetTile);
    // Highlight the tiles in different colors
    green.forEach((tile) => {
      const name = `${tile.row},${tile.col}`;
      const mesh = group_tiles.getObjectByName(name) as HexagonalFaceMesh;
      if (mesh) {
        mesh.userData.selected = true;
        mesh.userData.canClick = true;
        const originalColor = mesh.userData.originalColor;
        if (originalColor) {
          const tintedColor = originalColor.clone();
          if (hasMove && tile === targetTile) {
            // Tint with blue for move destination
            tintedColor.lerp(new Color("rgb(0, 150, 255)"), 0.2);
          } else {
            // Tint with green for valid targets
            tintedColor.lerp(new Color("rgb(0, 255, 100)"), 0.2);
          }
          mesh.material.color.copy(tintedColor);
        }
        newSelection.add(name);
      }
    });
    red.forEach((tile) => {
      const name = `${tile.row},${tile.col}`;
      const mesh = group_tiles.getObjectByName(name) as HexagonalFaceMesh;
      if (mesh) {
        mesh.userData.selected = true;
        mesh.userData.canClick = false;
        const originalColor = mesh.userData.originalColor;
        if (originalColor) {
          // Tint with red for invalid targets
          const tintedColor = originalColor.clone();
          tintedColor.lerp(new Color("rgb(255, 50, 50)"), 0.2);
          mesh.material.color.copy(tintedColor);
        }
        newSelection.add(name);
      }
    });
    // Set cursor type on highlight
    if (
      (document.body.style.cursor === "default" || document.body.style.cursor === "") &&
      green.size > 0 &&
      isAvailable
    ) {
      document.body.style.cursor = "pointer";
    } else if (
      document.body.style.cursor === "pointer" &&
      (green.size === 0 || isAvailable === false)
    ) {
      document.body.style.cursor = "default";
    }
  }

  // Apply colors to all tiles based on their state
  // Process all tiles that were previously highlighted or selected
  currentHighlights.forEach((name) => {
    const isHighlighted = newHighlights.has(name);
    const isSelected = newSelection.has(name);
    const mesh = group_tiles.getObjectByName(name) as HexagonalFaceMesh;

    if (mesh && mesh.userData.originalColor) {
      // Update states
      mesh.userData.highlight = isHighlighted;
      if (!isSelected) {
        mesh.userData.selected = false;
        mesh.userData.canClick = false;
      }

      // Apply color based on priority: selection > highlight > original
      if (isSelected) {
        // Selection color already applied in the selection loop above
      } else if (isHighlighted) {
        // Apply gray tint for highlighted tiles
        const highlightColor = mesh.userData.originalColor.clone();
        highlightColor.lerp(new Color("rgb(128, 128, 128)"), 0.4);
        mesh.material.color.copy(highlightColor);
      } else {
        // Reset to original if neither highlighted nor selected
        mesh.material.color.copy(mesh.userData.originalColor);
      }
    }
  });
  return new Set([...newHighlights, ...newSelection]);
};

/**
 * Highlight user information like health bars on intersection
 * Uses cached intersections to avoid redundant raycasting
 */
export const highlightUsers = (info: {
  group_users: Group;
  cachedIntersections: CachedIntersections;
  userId: string;
  users: ReturnedUserState[];
  currentHighlights: Set<string>;
}) => {
  // Definitions
  const { group_users, users, userId, currentHighlights } = info;
  const battleTileIntersects = info.cachedIntersections.battleTiles;
  const hit = battleTileIntersects.length > 0 && battleTileIntersects[0];
  const newSelection = new Set<string>();
  if (hit) {
    const intersected = hit.object as HexagonalFaceMesh;
    const targetTile = intersected.userData.tile;
    const target = users.find(
      (u) =>
        u.longitude === targetTile.col &&
        u.latitude === targetTile.row &&
        u.curHealth > 0 &&
        u.fledBattle === false,
    );
    if (target) {
      const userMesh = group_users.getObjectByName(target.userId) as Group;
      if (userMesh) {
        setStatusBarVisibility(userMesh, true);
        newSelection.add(target.userId);
      }
    }
  }
  // The active userId we always show status bars
  const userMesh = group_users.getObjectByName(userId) as Group;
  if (userMesh) {
    setStatusBarVisibility(userMesh, true);
    newSelection.add(userId);
  }
  // Remove highlights from tiles that are no longer in the path
  currentHighlights.forEach((name) => {
    if (!newSelection.has(name)) {
      const userMesh = group_users.getObjectByName(name) as Group;
      if (userMesh) setStatusBarVisibility(userMesh, false);
    }
  });
  return newSelection;
};

export const setStatusBarVisibility = (userMesh: Group, visible: boolean) => {
  const hp_background = userMesh.getObjectByName("hp_background") as Sprite;
  if (hp_background) {
    hp_background.visible = visible;
  }
  const hp_current = userMesh.getObjectByName("hp_current") as Sprite;
  if (hp_current) {
    hp_current.visible = visible;
  }
  const sp_background = userMesh.getObjectByName("sp_background") as Sprite;
  if (sp_background) {
    sp_background.visible = visible;
  }
  const sp_current = userMesh.getObjectByName("sp_current") as Sprite;
  if (sp_current) {
    sp_current.visible = visible;
  }
  const cp_background = userMesh.getObjectByName("cp_background") as Sprite;
  if (cp_background) {
    cp_background.visible = visible;
  }
  const cp_current = userMesh.getObjectByName("cp_current") as Sprite;
  if (cp_current) {
    cp_current.visible = visible;
  }
};

/**
 * Highlight different things in the environment based on raycaster
 * Uses cached intersections to avoid redundant raycasting
 */
export const highlightTooltips = (info: {
  group_ground: Group;
  cachedIntersections: CachedIntersections;
  battle: ReturnedBattle;
  currentTooltips: Set<string>;
}) => {
  // Definitions
  const { group_ground, battle, currentTooltips } = info;
  const intersects = info.cachedIntersections.ground;
  const newTooltips = new Set<string>();

  // Barriers
  const barrier = intersects.find((i) => i.object.parent?.userData.type === "barrier")
    ?.object.parent;
  if (barrier) {
    // Get the sprites
    const background = barrier.getObjectByName("hp_background") as Sprite;
    const bar = barrier.getObjectByName("hp_current") as Sprite;
    background.visible = true;
    bar.visible = true;
    // Update HP of barrier
    const effect = battle.groundEffects.find((e) => e.id === barrier.name);
    if (effect) {
      const typedEffect = effect as unknown as BarrierTagType;
      updateStatusBar(
        "hp_current",
        barrier as Group,
        typedEffect.curHealth / typedEffect.maxHealth,
      );
    }
    // Remember that we drew this
    newTooltips.add(barrier.name);
  }

  // Remove highlights from tiles that are no longer in the path
  currentTooltips.forEach((name) => {
    if (!newTooltips.has(name)) {
      const mesh = group_ground.getObjectByName(name) as Group;
      if (!mesh) return;
      const background = mesh.getObjectByName("hp_background") as Sprite;
      const bar = mesh.getObjectByName("hp_current") as Sprite;
      if (!background || !bar) return;
      background.visible = false;
      bar.visible = false;
    }
  });
  return newTooltips;
};

/**
 * Highlight ground effects on tiles when hovering
 * Uses cached intersections to avoid redundant raycasting
 */
export const highlightTileTooltips = (info: {
  group_tiles: Group;
  cachedIntersections: CachedIntersections;
  battle: ReturnedBattle;
  currentTileTooltips: Set<string>;
  mouseX?: number;
  mouseY?: number;
}) => {
  // Definitions
  const { group_tiles, battle, currentTileTooltips } = info;
  const battleTileIntersects = info.cachedIntersections.battleTiles;
  const newTooltips = new Set<string>();

  // Check if we're hovering over a battle tile (not border tiles)
  const tileHit = battleTileIntersects.length > 0 ? battleTileIntersects[0] : undefined;
  if (tileHit) {
    const tile = tileHit.object.userData.tile as TerrainHex;
    const tileName = `${tile.row},${tile.col}`;

    // Find ground effects on this tile
    const groundEffectsOnTile = battle.groundEffects.filter(
      (effect) => effect.longitude === tile.col && effect.latitude === tile.row,
    );

    if (groundEffectsOnTile.length > 0) {
      // Show tooltip for this tile
      newTooltips.add(tileName);

      // Create or update tooltip element
      let tooltipElement = document.getElementById(`tile-tooltip-${tileName}`);
      if (!tooltipElement) {
        tooltipElement = document.createElement("div");
        tooltipElement.id = `tile-tooltip-${tileName}`;
        tooltipElement.className =
          "fixed z-50 bg-black bg-opacity-80 text-white text-xs p-2 rounded pointer-events-none";
        document.body.appendChild(tooltipElement);
      }

      // Update tooltip content
      const effectTexts = groundEffectsOnTile.map((effect) => {
        const roundsLeft = effect.rounds || 0;
        return `${effect.type} (${roundsLeft} rounds)`;
      });
      tooltipElement.textContent = `Ground Effects: ${effectTexts.join(", ")}`;

      // Position tooltip near mouse cursor
      const mouseX = info.mouseX || 0;
      const mouseY = info.mouseY || 0;
      tooltipElement.style.left = `${mouseX + 10}px`;
      tooltipElement.style.top = `${mouseY - 30}px`;
      tooltipElement.style.display = "block";
    }
  }

  // Remove tooltips for tiles that are no longer hovered
  currentTileTooltips.forEach((tileName) => {
    if (!newTooltips.has(tileName)) {
      const tooltipElement = document.getElementById(`tile-tooltip-${tileName}`);
      if (tooltipElement) {
        tooltipElement.style.display = "none";
      }
    }
  });

  return newTooltips;
};
