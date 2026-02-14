CREATE TABLE `AbEvent` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191),
	`experiment` varchar(191) NOT NULL,
	`variant` varchar(191) NOT NULL,
	`event` varchar(191) NOT NULL,
	`source` varchar(191),
	`ip` varchar(191),
	`userAgent` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `AbEvent_id` PRIMARY KEY(`id`),
	CONSTRAINT `AbEvent_event_ip_key` UNIQUE(`event`,`ip`)
);

CREATE TABLE `ActionLog` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`tableName` varchar(191),
	`changes` json NOT NULL,
	`relatedId` varchar(191),
	`relatedText` varchar(191),
	`relatedImage` varchar(191),
	`relatedValue` double NOT NULL DEFAULT 0,
	CONSTRAINT `ActionLog_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ActivityStreakConfig` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text,
	`image` varchar(500),
	`totalDays` int NOT NULL DEFAULT 14,
	`streakType` enum('RECURRING','EVENT_PASS') NOT NULL DEFAULT 'RECURRING',
	`isActive` boolean NOT NULL DEFAULT true,
	`ryoCost` int NOT NULL DEFAULT 0,
	`repsCost` int NOT NULL DEFAULT 0,
	`seichiSilverCost` int NOT NULL DEFAULT 0,
	`startDate` datetime(3),
	`endDate` datetime(3),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`createdByUserId` varchar(191),
	CONSTRAINT `ActivityStreakConfig_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ActivityStreakReward` (
	`id` varchar(191) NOT NULL,
	`configId` varchar(191) NOT NULL,
	`dayNumber` int NOT NULL,
	`rewards` json NOT NULL,
	`image` varchar(500),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `ActivityStreakReward_id` PRIMARY KEY(`id`),
	CONSTRAINT `ActivityStreakReward_configId_dayNumber_key` UNIQUE(`configId`,`dayNumber`)
);

CREATE TABLE `AiProfile` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`rules` json NOT NULL,
	`includeDefaultRules` boolean NOT NULL DEFAULT true,
	CONSTRAINT `AiProfile_id` PRIMARY KEY(`id`),
	CONSTRAINT `AiProfile_userId_idx` UNIQUE(`userId`)
);

CREATE TABLE `AnbuSquad` (
	`id` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`leaderId` varchar(191),
	`villageId` varchar(191) NOT NULL,
	`pvpActivity` int NOT NULL DEFAULT 0,
	`kageOrderId` varchar(191) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`espionageLevel` int NOT NULL DEFAULT 0,
	`stealthLevel` int NOT NULL DEFAULT 0,
	`leaderOrderId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `AnbuSquad_id` PRIMARY KEY(`id`),
	CONSTRAINT `AnbuSquad_name_key` UNIQUE(`name`)
);

CREATE TABLE `AuctionBid` (
	`id` varchar(191) NOT NULL,
	`auctionId` varchar(191) NOT NULL,
	`bidderId` varchar(191) NOT NULL,
	`amount` double NOT NULL,
	`status` enum('ACTIVE','REFUNDED','WON') NOT NULL DEFAULT 'ACTIVE',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `AuctionBid_id` PRIMARY KEY(`id`)
);

CREATE TABLE `AuctionListing` (
	`id` varchar(191) NOT NULL,
	`sellerId` varchar(191) NOT NULL,
	`buyerId` varchar(191),
	`userItemId` varchar(191) NOT NULL,
	`listingType` enum('AUCTION','DIRECT') NOT NULL,
	`targetUserId` varchar(191),
	`startingPrice` double NOT NULL,
	`buyoutPrice` double,
	`currentPrice` double NOT NULL,
	`currencyType` enum('MONEY','REPUTATION') NOT NULL DEFAULT 'MONEY',
	`expiresAt` datetime(3) NOT NULL,
	`status` enum('ACTIVE','SOLD','EXPIRED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `AuctionListing_id` PRIMARY KEY(`id`)
);

CREATE TABLE `AutomatedModeration` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`content` text NOT NULL,
	`relationType` enum('comment','privateMessage','forumPost','userReport','userNindo','clanOrder','anbuOrder','kageOrder','userAvatar') NOT NULL,
	`sexual` boolean NOT NULL DEFAULT false,
	`sexual_minors` boolean NOT NULL DEFAULT false,
	`harassment` boolean NOT NULL DEFAULT false,
	`harassment_threatening` boolean NOT NULL DEFAULT false,
	`hate` boolean NOT NULL DEFAULT false,
	`hate_threatening` boolean NOT NULL DEFAULT false,
	`illicit` boolean NOT NULL DEFAULT false,
	`illicit_violent` boolean NOT NULL DEFAULT false,
	`self_harm` boolean NOT NULL DEFAULT false,
	`self_harm_intent` boolean NOT NULL DEFAULT false,
	`self_harm_instructions` boolean NOT NULL DEFAULT false,
	`violence` boolean NOT NULL DEFAULT false,
	`violence_graphic` boolean NOT NULL DEFAULT false,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `AutomatedModeration_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Badge` (
	`id` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(500) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `Badge_id` PRIMARY KEY(`id`),
	CONSTRAINT `Badge_name_key` UNIQUE(`name`)
);

CREATE TABLE `BankTransfers` (
	`senderId` varchar(191) NOT NULL,
	`receiverId` varchar(191) NOT NULL,
	`amount` int NOT NULL,
	`type` enum('bank','sensei','recruiter') NOT NULL DEFAULT 'bank',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3))
);

CREATE TABLE `Battle` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`roundStartAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`background` enum('ocean','ground','dessert','ice','snow','arena','default') NOT NULL,
	`width` int NOT NULL DEFAULT 13,
	`height` int NOT NULL DEFAULT 9,
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING','RAID') NOT NULL,
	`usersState` json NOT NULL,
	`usersEffects` json NOT NULL,
	`groundEffects` json NOT NULL,
	`extraState` json NOT NULL,
	`rewardScaling` double NOT NULL DEFAULT 1,
	`version` int NOT NULL DEFAULT 1,
	`round` int NOT NULL DEFAULT 1,
	`forceKeepPools` boolean NOT NULL DEFAULT false,
	`activeUserId` varchar(191),
	CONSTRAINT `Battle_id` PRIMARY KEY(`id`),
	CONSTRAINT `Battle_id_version_key` UNIQUE(`id`,`version`)
);

CREATE TABLE `BattleAction` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`battleId` varchar(191) NOT NULL,
	`battleVersion` int NOT NULL,
	`battleRound` int NOT NULL DEFAULT 0,
	`actionId` varchar(191) NOT NULL DEFAULT 'unknown',
	`userId` varchar(191) NOT NULL DEFAULT 'unknown',
	`description` text NOT NULL,
	`appliedEffects` json NOT NULL,
	CONSTRAINT `BattleAction_id` PRIMARY KEY(`id`),
	CONSTRAINT `BattleAction_round_key` UNIQUE(`battleId`,`battleVersion`,`battleRound`)
);

CREATE TABLE `BattleHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`battleId` varchar(191) NOT NULL,
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING','RAID'),
	`attackedId` varchar(191) NOT NULL,
	`defenderId` varchar(191) NOT NULL,
	CONSTRAINT `BattleHistory_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Bloodline` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`statClassification` enum('Highest','Ninjutsu','Genjutsu','Taijutsu','Bukijutsu'),
	`description` text NOT NULL,
	`effects` json NOT NULL,
	`regenIncrease` int NOT NULL DEFAULT 0,
	`villageId` varchar(191) DEFAULT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`rank` enum('D','C','B','A','S','H') NOT NULL,
	`hidden` boolean NOT NULL DEFAULT false,
	`difficulty` enum('Easy','Medium','Hard','Expert'),
	`traits` varchar(256),
	CONSTRAINT `Bloodline_id` PRIMARY KEY(`id`),
	CONSTRAINT `Bloodline_name_key` UNIQUE(`name`)
);

CREATE TABLE `BloodlineReskin` (
	`id` varchar(191) NOT NULL,
	`bloodlineId` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(191) NOT NULL,
	`createdBy` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `BloodlineReskin_id` PRIMARY KEY(`id`),
	CONSTRAINT `BloodlineReskin_bloodlineId_name_key` UNIQUE(`bloodlineId`,`name`)
);

CREATE TABLE `BloodlineRolls` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`bloodlineId` varchar(191),
	`used` smallint NOT NULL DEFAULT 0,
	`pityRolls` tinyint NOT NULL DEFAULT 0,
	`type` enum('NATURAL','ITEM','PITY','DIRECT','QUEST','REGISTRATION') NOT NULL DEFAULT 'NATURAL',
	`rank` enum('D','C','B','A','S','H'),
	CONSTRAINT `BloodlineRolls_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Bounty` (
	`id` varchar(191) NOT NULL,
	`targetUserId` varchar(191) NOT NULL,
	`creatorUserId` varchar(191) NOT NULL,
	`amountRyo` bigint NOT NULL,
	`originalAmountRyo` bigint NOT NULL,
	`status` enum('OPEN','CLAIMED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'OPEN',
	`claimedByUserId` varchar(191),
	`collectedAt` datetime(3),
	`claimedAt` datetime(3),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `Bounty_id` PRIMARY KEY(`id`)
);

CREATE TABLE `BountyContribution` (
	`id` varchar(191) NOT NULL,
	`bountyId` varchar(191) NOT NULL,
	`contributorUserId` varchar(191) NOT NULL,
	`amountRyo` bigint NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `BountyContribution_id` PRIMARY KEY(`id`)
);

CREATE TABLE `BountySignup` (
	`id` varchar(191) NOT NULL,
	`bountyId` varchar(191) NOT NULL,
	`hunterUserId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `BountySignup_id` PRIMARY KEY(`id`),
	CONSTRAINT `BountySignup_bounty_hunter_key` UNIQUE(`bountyId`,`hunterUserId`)
);

CREATE TABLE `CannedResponse` (
	`id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`createdByUserId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `CannedResponse_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Captcha` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(191) NOT NULL,
	`captcha` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 1 DAY ),
	`success` boolean NOT NULL DEFAULT false,
	`used` boolean NOT NULL DEFAULT false,
	CONSTRAINT `Captcha_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Clan` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`villageId` varchar(191) NOT NULL,
	`founderId` varchar(191) NOT NULL,
	`leaderId` varchar(191) NOT NULL,
	`coLeader1` varchar(191),
	`coLeader2` varchar(191),
	`coLeader3` varchar(191),
	`assassin1` varchar(191),
	`assassin2` varchar(191),
	`assassin3` varchar(191),
	`assassin4` varchar(191),
	`assassin5` varchar(191),
	`assassin6` varchar(191),
	`assassin7` varchar(191),
	`assassin8` varchar(191),
	`assassin9` varchar(191),
	`assassin10` varchar(191),
	`leaderOrderId` varchar(191) NOT NULL,
	`trainingBoost` double NOT NULL DEFAULT 0,
	`ryoBoost` double NOT NULL DEFAULT 0,
	`regenBoost` double NOT NULL DEFAULT 0,
	`missionRewardBoost` double NOT NULL DEFAULT 0,
	`craftingTimeBoost` double NOT NULL DEFAULT 0,
	`craftingExpBoost` double NOT NULL DEFAULT 0,
	`hunterExpBoost` double NOT NULL DEFAULT 0,
	`gathererExpBoost` double NOT NULL DEFAULT 0,
	`elderNomineeId` varchar(191),
	`elderCutoffMonth` tinyint,
	`elderCutoffYear` smallint,
	`elderCutoffRank` tinyint,
	`activityPoints` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	`bank` bigint NOT NULL DEFAULT 0,
	`pvpActivity` int NOT NULL DEFAULT 0,
	`repTreasury` int NOT NULL DEFAULT 0,
	`hasHideout` boolean NOT NULL DEFAULT false,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `Clan_id` PRIMARY KEY(`id`),
	CONSTRAINT `Clan_name_key` UNIQUE(`name`)
);

CREATE TABLE `ConceptImage` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`image` varchar(191),
	`video` varchar(191),
	`mediaType` enum('image','video') NOT NULL DEFAULT 'image',
	`replicateId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`status` varchar(191) NOT NULL DEFAULT 'started',
	`hidden` boolean NOT NULL DEFAULT false,
	`prompt` varchar(5000) NOT NULL,
	`negative_prompt` varchar(5000) NOT NULL DEFAULT '',
	`seed` int NOT NULL DEFAULT 42,
	`guidance_scale` int NOT NULL DEFAULT 4,
	`n_likes` int NOT NULL DEFAULT 0,
	`n_loves` int NOT NULL DEFAULT 0,
	`n_laugh` int NOT NULL DEFAULT 0,
	`n_comments` int NOT NULL DEFAULT 0,
	`description` varchar(255),
	`done` boolean NOT NULL DEFAULT false,
	CONSTRAINT `ConceptImage_id` PRIMARY KEY(`id`),
	CONSTRAINT `concept_image_key` UNIQUE(`image`)
);

CREATE TABLE `ContentBackup` (
	`id` varchar(191) NOT NULL,
	`type` enum('bloodline','jutsu','item','ai') NOT NULL,
	`sqlText` mediumtext NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `ContentBackup_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ContentTag` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	CONSTRAINT `ContentTag_id` PRIMARY KEY(`id`),
	CONSTRAINT `ContentTag_name_key` UNIQUE(`name`)
);

CREATE TABLE `Conversation` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191),
	`createdById` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`isLocked` boolean NOT NULL DEFAULT false,
	`isPublic` boolean NOT NULL DEFAULT true,
	`isStaffAvailable` boolean NOT NULL DEFAULT false,
	`isEnabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `Conversation_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ConversationComment` (
	`id` varchar(191) NOT NULL,
	`content` text NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`authorId` varchar(191) NOT NULL,
	`conversationId` varchar(191),
	`reactions` json NOT NULL DEFAULT ('{}'),
	`isPinned` boolean NOT NULL DEFAULT false,
	`isReported` boolean NOT NULL DEFAULT false,
	`isStaffOnly` boolean NOT NULL DEFAULT false,
	CONSTRAINT `ConversationComment_id` PRIMARY KEY(`id`)
);

CREATE TABLE `CraftingRequirement` (
	`id` varchar(191) NOT NULL,
	`craftItemId` varchar(191) NOT NULL,
	`requirementItemId` varchar(191) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `CraftingRequirement_id` PRIMARY KEY(`id`)
);

CREATE TABLE `DailyBankInterest` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`amount` bigint NOT NULL,
	`date` date NOT NULL,
	`claimed` boolean NOT NULL DEFAULT false,
	`interestPercent` int NOT NULL,
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `DailyBankInterest_id` PRIMARY KEY(`id`),
	CONSTRAINT `DailyBankInterest_userId_date_key` UNIQUE(`userId`,`date`)
);

CREATE TABLE `DamageCalculation` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`state` json NOT NULL,
	`active` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `DamageCalculation_id` PRIMARY KEY(`id`)
);

CREATE TABLE `DataBattleAction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('jutsu','item','bloodline','basic','ai') NOT NULL,
	`contentId` varchar(191) NOT NULL,
	`relatedBloodlineId` varchar(191),
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING','RAID') NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`battleWon` tinyint NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	CONSTRAINT `DataBattleAction_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueContentId` UNIQUE(`type`,`contentId`,`battleType`,`battleWon`,`relatedBloodlineId`)
);

CREATE TABLE `EmailReminder` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(191),
	`callName` varchar(191),
	`email` varchar(191) NOT NULL,
	`latestRejoinRequest` datetime(3),
	`lastActivity` datetime(3),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`secret` varchar(191) NOT NULL,
	`disabled` boolean NOT NULL DEFAULT false,
	`validated` boolean NOT NULL DEFAULT true,
	CONSTRAINT `EmailReminder_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ForumBoard` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`summary` text NOT NULL,
	`group` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`nPosts` int NOT NULL DEFAULT 0,
	`nThreads` int NOT NULL DEFAULT 0,
	CONSTRAINT `ForumBoard_id` PRIMARY KEY(`id`),
	CONSTRAINT `ForumBoard_name_key` UNIQUE(`name`)
);

CREATE TABLE `ForumPost` (
	`id` varchar(191) NOT NULL,
	`content` text NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`threadId` varchar(191) NOT NULL,
	`authorId` varchar(191) NOT NULL,
	`isReported` boolean NOT NULL DEFAULT false,
	CONSTRAINT `ForumPost_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ForumThread` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`image` varchar(512),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`boardId` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`nPosts` int NOT NULL DEFAULT 0,
	`isPinned` boolean NOT NULL DEFAULT false,
	`isLocked` boolean NOT NULL DEFAULT false,
	CONSTRAINT `ForumThread_id` PRIMARY KEY(`id`)
);

CREATE TABLE `GameAsset` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`type` enum('STATIC','ANIMATION','SCENE_BACKGROUND','SCENE_CHARACTER','SFX','MUSIC') NOT NULL,
	`image` varchar(191) NOT NULL,
	`url` varchar(191) NOT NULL,
	`frames` tinyint NOT NULL DEFAULT 1,
	`speed` tinyint NOT NULL DEFAULT 1,
	`hidden` boolean NOT NULL DEFAULT true,
	`folder` varchar(191) NOT NULL DEFAULT '',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`licenseDetails` text NOT NULL DEFAULT ('TNR'),
	`createdByUserId` varchar(191),
	`onInitialBattleField` boolean NOT NULL DEFAULT false,
	CONSTRAINT `GameAsset_id` PRIMARY KEY(`id`)
);

CREATE TABLE `GameAssetTag` (
	`id` varchar(191) NOT NULL,
	`assetId` varchar(191) NOT NULL,
	`tagId` varchar(191) NOT NULL,
	CONSTRAINT `GameAssetTag_id` PRIMARY KEY(`id`),
	CONSTRAINT `GameAssetTag_assetId_tag_key` UNIQUE(`assetId`,`tagId`)
);

CREATE TABLE `GameSetting` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`time` datetime(3) NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	CONSTRAINT `GameSetting_id` PRIMARY KEY(`id`)
);

CREATE TABLE `HistoricalAvatar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avatar` varchar(191),
	`avatarLight` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`replicateId` varchar(191),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`status` varchar(191) NOT NULL DEFAULT 'started',
	`done` boolean NOT NULL DEFAULT false,
	CONSTRAINT `HistoricalAvatar_id` PRIMARY KEY(`id`),
	CONSTRAINT `HistoricalAvatar_replicateId_key` UNIQUE(`replicateId`),
	CONSTRAINT `HistoricalAvatar_avatar_key` UNIQUE(`avatar`)
);

CREATE TABLE `HistoricalIp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(191) NOT NULL,
	`ip` varchar(191) NOT NULL,
	`usedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `HistoricalIp_id` PRIMARY KEY(`id`),
	CONSTRAINT `HistoricalIp_userId_ip_key` UNIQUE(`userId`,`ip`)
);

CREATE TABLE `HistoricalSoundEffect` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(191),
	`relationId` varchar(191),
	`userId` varchar(191) NOT NULL,
	`replicateId` varchar(191),
	`secondsTotal` int NOT NULL DEFAULT 0,
	`prompt` text,
	`negativePrompt` text,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`status` varchar(191) NOT NULL DEFAULT 'started',
	`done` boolean NOT NULL DEFAULT false,
	CONSTRAINT `HistoricalSoundEffect_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Item` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`expireFromStoreAt` date,
	`effects` json NOT NULL,
	`itemType` enum('WEAPON','CONSUMABLE','ARMOR','ACCESSORY','MATERIAL','KEYSTONE','CRYSTAL','OTHER') NOT NULL,
	`rarity` enum('COMMON','RARE','EPIC','LEGENDARY') NOT NULL,
	`slot` enum('HEAD','CHEST','LEGS','FEET','HAND','THROWN','ITEM','WAIST','KEYSTONE','NONE') NOT NULL,
	`cooldown` int NOT NULL DEFAULT 0,
	`weaponType` enum('STAFF','AXE','FIST_WEAPON','SHURIKEN','SICKLE','DAGGER','SWORD','POLEARM','FLAIL','CHAIN','FAN','BOW','HAMMER','NONE') NOT NULL DEFAULT 'NONE',
	`target` enum('SELF','OTHER_USER','OPPONENT','ALLY','CHARACTER','GROUND','EMPTY_GROUND') NOT NULL,
	`method` enum('SINGLE','ALL','AOE_CIRCLE_SPAWN','AOE_LINE_SHOOT','AOE_WALL_SHOOT','AOE_LARGE_WALL_SHOOT','AOE_CIRCLE_SHOOT','AOE_SPIRAL_SHOOT') NOT NULL DEFAULT 'SINGLE',
	`cost` int NOT NULL DEFAULT 1,
	`reputationCost` int NOT NULL DEFAULT 0,
	`seichiSilverCost` int NOT NULL DEFAULT 0,
	`stackSize` int NOT NULL DEFAULT 1,
	`image` varchar(191) NOT NULL,
	`destroyOnUse` boolean NOT NULL DEFAULT false,
	`range` int NOT NULL DEFAULT 0,
	`chakraCost` double NOT NULL DEFAULT 0,
	`staminaCost` double NOT NULL DEFAULT 0,
	`healthCost` double NOT NULL DEFAULT 0,
	`staminaCostReducePerLvl` double NOT NULL DEFAULT 0,
	`chakraCostReducePerLvl` double NOT NULL DEFAULT 0,
	`healthCostReducePerLvl` double NOT NULL DEFAULT 0,
	`actionCostPerc` double NOT NULL DEFAULT 60,
	`battleDescription` text NOT NULL DEFAULT (''),
	`canStack` boolean NOT NULL DEFAULT false,
	`maxImbueNumber` int NOT NULL DEFAULT 1,
	`maxDurability` smallint unsigned NOT NULL DEFAULT 100,
	`inShop` boolean NOT NULL DEFAULT true,
	`isEventItem` boolean NOT NULL DEFAULT false,
	`hidden` boolean NOT NULL DEFAULT false,
	`maxEquips` int NOT NULL DEFAULT 1,
	`preventBattleUsage` boolean NOT NULL DEFAULT false,
	`requiredLevel` int NOT NULL DEFAULT 1,
	`canBeCrafted` boolean NOT NULL DEFAULT false,
	`canBeImbued` boolean NOT NULL DEFAULT false,
	`canBeHunted` boolean NOT NULL DEFAULT false,
	`canBeGathered` boolean NOT NULL DEFAULT false,
	`canBeTraded` boolean NOT NULL DEFAULT false,
	`craftingExperience` int NOT NULL DEFAULT 0,
	`crystalTargetTypes` enum('WEAPON','CONSUMABLE','ARMOR','ACCESSORY','MATERIAL','KEYSTONE','CRYSTAL','OTHER'),
	`bloodlineId` varchar(191),
	`battleUsageType` enum('PVE','PVP','BOTH') NOT NULL DEFAULT 'BOTH',
	CONSTRAINT `Item_id` PRIMARY KEY(`id`),
	CONSTRAINT `Item_name_key` UNIQUE(`name`)
);

CREATE TABLE `ItemLoadout` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`itemData` json NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `ItemLoadout_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Jutsu` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`extraBaseCost` smallint unsigned NOT NULL DEFAULT 0,
	`effects` json NOT NULL,
	`target` enum('SELF','OTHER_USER','OPPONENT','ALLY','CHARACTER','GROUND','EMPTY_GROUND') NOT NULL,
	`range` int NOT NULL,
	`cooldown` int NOT NULL DEFAULT 0,
	`bloodlineId` varchar(191),
	`requiredLevel` int NOT NULL DEFAULT 1,
	`requiredRank` enum('STUDENT','GENIN','CHUNIN','JONIN','ELITE JONIN','ELDER','NONE') NOT NULL,
	`jutsuType` enum('NORMAL','SPECIAL','BLOODLINE','FORBIDDEN','LOYALTY','CLAN','EVENT','AI') NOT NULL,
	`image` varchar(191) NOT NULL,
	`jutsuWeapon` enum('STAFF','AXE','FIST_WEAPON','SHURIKEN','SICKLE','DAGGER','SWORD','POLEARM','FLAIL','CHAIN','FAN','BOW','HAMMER','NONE') NOT NULL DEFAULT 'NONE',
	`statClassification` enum('Highest','Ninjutsu','Genjutsu','Taijutsu','Bukijutsu'),
	`battleDescription` text NOT NULL,
	`jutsuRank` enum('D','C','B','A','S','H') NOT NULL DEFAULT 'D',
	`actionCostPerc` double NOT NULL DEFAULT 80,
	`staminaCost` double NOT NULL DEFAULT 0.05,
	`chakraCost` double NOT NULL DEFAULT 0.05,
	`staminaCostReducePerLvl` double NOT NULL DEFAULT 0,
	`chakraCostReducePerLvl` double NOT NULL DEFAULT 0,
	`healthCostReducePerLvl` double NOT NULL DEFAULT 0,
	`healthCost` double NOT NULL DEFAULT 0,
	`villageId` varchar(191),
	`method` enum('SINGLE','ALL','AOE_CIRCLE_SPAWN','AOE_LINE_SHOOT','AOE_WALL_SHOOT','AOE_LARGE_WALL_SHOOT','AOE_CIRCLE_SHOOT','AOE_SPIRAL_SHOOT') NOT NULL DEFAULT 'SINGLE',
	`hidden` boolean NOT NULL DEFAULT false,
	`injectableInBattle` boolean NOT NULL DEFAULT false,
	`battleUsageType` enum('PVE','PVP','BOTH') NOT NULL DEFAULT 'BOTH',
	CONSTRAINT `Jutsu_id` PRIMARY KEY(`id`),
	CONSTRAINT `Jutsu_name_key` UNIQUE(`name`)
);

CREATE TABLE `JutsuLoadout` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`content` json NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `JutsuLoadout_id` PRIMARY KEY(`id`)
);

CREATE TABLE `JutsuReskin` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`jutsuId` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`battleDescription` text NOT NULL,
	`image` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `JutsuReskin_id` PRIMARY KEY(`id`),
	CONSTRAINT `JutsuReskin_userId_jutsuId_key` UNIQUE(`userId`,`jutsuId`)
);

CREATE TABLE `KageDefendedChallenges` (
	`id` varchar(191) NOT NULL,
	`villageId` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`kageId` varchar(191) NOT NULL,
	`didWin` tinyint NOT NULL DEFAULT 0,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`rounds` int NOT NULL,
	CONSTRAINT `KageDefendedChallenges_id` PRIMARY KEY(`id`)
);

CREATE TABLE `LinkPromotion` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`url` varchar(191) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`reviewed` boolean NOT NULL DEFAULT false,
	`reviewedBy` varchar(191),
	`reviewedAt` datetime(3),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `LinkPromotion_id` PRIMARY KEY(`id`)
);

CREATE TABLE `LogTimeDurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING','RAID') NOT NULL,
	`winnerLevel` int NOT NULL,
	`loserLevel` int NOT NULL,
	`rounds` int NOT NULL,
	`count` int NOT NULL,
	CONSTRAINT `LogTimeDurations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueEntry` UNIQUE(`battleType`,`winnerLevel`,`loserLevel`,`rounds`)
);

CREATE TABLE `LogQueueLengths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rankedRank` enum('Unranked','Wood','Adept','Master','Legend','Sannin') NOT NULL,
	`ceiledMinutes` int NOT NULL,
	`count` int NOT NULL,
	CONSTRAINT `LogQueueLengths_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueEntry` UNIQUE(`rankedRank`,`ceiledMinutes`)
);

CREATE TABLE `LogRankedPicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('jutsu','item','consumable') NOT NULL,
	`contentId` varchar(191) NOT NULL,
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING','RAID') NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	CONSTRAINT `LogRankedPicks_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueContentId` UNIQUE(`type`,`contentId`,`battleType`)
);

CREATE TABLE `MpvpBattleQueue` (
	`id` varchar(191) NOT NULL,
	`winnerId` varchar(191),
	`battleId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`battleType` enum('CLAN_BATTLE','SHRINE_BATTLE','RAID_BATTLE') NOT NULL DEFAULT 'CLAN_BATTLE',
	`attackerEntityId` varchar(191) NOT NULL,
	`defenderEntityId` varchar(191) NOT NULL,
	`sector` smallint,
	CONSTRAINT `MpvpBattleQueue_id` PRIMARY KEY(`id`)
);

CREATE TABLE `MpvpBattleUser` (
	`id` varchar(191) NOT NULL,
	`clanBattleId` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`side` enum('ATTACKER','DEFENDER') NOT NULL,
	`slot` tinyint NOT NULL,
	CONSTRAINT `MpvpBattleUser_id` PRIMARY KEY(`id`),
	CONSTRAINT `MpvpBattleUser_clanBattleId_side_slot_key` UNIQUE(`clanBattleId`,`side`,`slot`),
	CONSTRAINT `MpvpBattleUser_userId_key` UNIQUE(`userId`)
);

CREATE TABLE `Notification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`content` text NOT NULL,
	CONSTRAINT `Notification_id` PRIMARY KEY(`id`)
);

CREATE TABLE `PaypalSubscription` (
	`id` varchar(191) NOT NULL,
	`createdById` varchar(191) NOT NULL,
	`affectedUserId` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL,
	`federalStatus` enum('NONE','NORMAL','SILVER','GOLD') NOT NULL,
	`orderId` varchar(191),
	`subscriptionId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `PaypalSubscription_id` PRIMARY KEY(`id`),
	CONSTRAINT `PaypalSubscription_subscriptionId_key` UNIQUE(`subscriptionId`),
	CONSTRAINT `PaypalSubscription_orderId_key` UNIQUE(`orderId`)
);

CREATE TABLE `PaypalTransaction` (
	`id` varchar(191) NOT NULL,
	`createdById` varchar(191),
	`affectedUserId` varchar(191),
	`transactionId` varchar(191) NOT NULL,
	`transactionUpdatedDate` varchar(191) NOT NULL,
	`orderId` varchar(191),
	`invoiceId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`amount` double NOT NULL,
	`type` enum('REP_PURCHASE','REFERRAL') NOT NULL DEFAULT 'REP_PURCHASE',
	`reputationPoints` int NOT NULL DEFAULT 0,
	`currency` varchar(191) NOT NULL DEFAULT 'USD',
	`status` varchar(191) NOT NULL,
	`rawData` json NOT NULL,
	CONSTRAINT `PaypalTransaction_id` PRIMARY KEY(`id`),
	CONSTRAINT `PaypalTransaction_orderId_key` UNIQUE(`orderId`)
);

CREATE TABLE `PaypalWebhookMessage` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`eventType` varchar(191) NOT NULL,
	`rawData` json NOT NULL,
	`handled` boolean NOT NULL DEFAULT false,
	CONSTRAINT `PaypalWebhookMessage_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Poll` (
	`id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`allowCustomOptions` boolean NOT NULL DEFAULT false,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`endDate` datetime(3),
	`createdByUserId` varchar(191) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `Poll_id` PRIMARY KEY(`id`)
);

CREATE TABLE `PollOption` (
	`id` varchar(191) NOT NULL,
	`pollId` varchar(191) NOT NULL,
	`text` varchar(255) NOT NULL,
	`optionType` enum('text','user') NOT NULL DEFAULT 'text',
	`targetUserId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`createdByUserId` varchar(191) NOT NULL,
	`isCustomOption` boolean NOT NULL DEFAULT false,
	CONSTRAINT `PollOption_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Quest` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(191),
	`description` varchar(5000),
	`successDescription` varchar(5000),
	`questRank` enum('D','C','B','A','S','H') NOT NULL DEFAULT 'D',
	`medicalRank` enum('NONE','NOVICE','APPRENTICE','MASTER','LEGENDARY') DEFAULT 'NONE',
	`huntingRank` enum('NONE','D RANK','C RANK','B RANK','A RANK','S RANK') DEFAULT 'NONE',
	`gatheringRank` enum('NONE','D RANK','C RANK','B RANK','A RANK','S RANK') DEFAULT 'NONE',
	`requiredLevel` int NOT NULL DEFAULT 1,
	`prerequisiteQuestId` varchar(191),
	`tierLevel` int,
	`questType` enum('starter','tier','daily','mission','errand','crime','exam','event','story','anbu','medical','hunting','gathering','battlepyramid','pvp','achievement','war','raid') NOT NULL,
	`content` json NOT NULL,
	`hidden` boolean NOT NULL DEFAULT false,
	`consecutiveObjectives` boolean NOT NULL DEFAULT true,
	`requiredVillage` varchar(191),
	`requiredBloodlineId` varchar(191),
	`maxLevel` int NOT NULL DEFAULT 100,
	`maxAttempts` int NOT NULL DEFAULT 1,
	`maxCompletes` int NOT NULL DEFAULT 1,
	`retryDelay` enum('daily','weekly','monthly','none') NOT NULL DEFAULT 'none',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`endsAt` date,
	`startsAt` date,
	`raidBossMaxHealth` bigint,
	`raidBossCurrentHealth` bigint,
	`raidEndsAt` datetime(3),
	`raidCaptureDeadline` datetime(3),
	`raidGracePeriodEnd` datetime(3),
	CONSTRAINT `Quest_id` PRIMARY KEY(`id`),
	CONSTRAINT `tierLevel` UNIQUE(`tierLevel`)
);

CREATE TABLE `QuestHistory` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`questId` varchar(191) NOT NULL,
	`questType` enum('starter','tier','daily','mission','errand','crime','exam','event','story','anbu','medical','hunting','gathering','battlepyramid','pvp','achievement','war','raid') NOT NULL,
	`startedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`endedAt` datetime(3),
	`completed` tinyint NOT NULL DEFAULT 0,
	`previousCompletes` int NOT NULL DEFAULT 0,
	`previousAttempts` int NOT NULL DEFAULT 0,
	CONSTRAINT `QuestHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueUserIdQuestId` UNIQUE(`userId`,`questId`)
);

CREATE TABLE `RaidDamageThreshold` (
	`id` varchar(191) NOT NULL,
	`questId` varchar(191) NOT NULL,
	`damageRequired` bigint NOT NULL,
	`sortOrder` tinyint NOT NULL DEFAULT 0,
	`rewards` json NOT NULL,
	`effects` json NOT NULL DEFAULT ('[]'),
	`effectDurationMinutes` int NOT NULL DEFAULT 60,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RaidDamageThreshold_id` PRIMARY KEY(`id`)
);

CREATE TABLE `RaidParticipation` (
	`id` varchar(191) NOT NULL,
	`questId` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`damageDealt` bigint NOT NULL DEFAULT 0,
	`battleCount` int NOT NULL DEFAULT 0,
	`rewardsClaimed` json NOT NULL DEFAULT ('[]'),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RaidParticipation_id` PRIMARY KEY(`id`),
	CONSTRAINT `RaidParticipation_questId_userId` UNIQUE(`questId`,`userId`)
);

CREATE TABLE `RankedLoadout` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`loadout` json NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RankedLoadout_id` PRIMARY KEY(`id`)
);

CREATE TABLE `RankedPvpQueue` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`rankedLp` int NOT NULL,
	`queueStartTime` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RankedPvpQueue_id` PRIMARY KEY(`id`)
);

CREATE TABLE `RankedSeason` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`startDate` datetime(3) NOT NULL,
	`endDate` datetime(3) NOT NULL,
	`rewards` json NOT NULL,
	`ended` boolean NOT NULL DEFAULT false,
	`paused` boolean NOT NULL DEFAULT false,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RankedSeason_id` PRIMARY KEY(`id`)
);

CREATE TABLE `RankedUserRewards` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`seasonId` varchar(191) NOT NULL,
	`division` enum('Unranked','Wood','Adept','Master','Legend','Sannin') NOT NULL,
	`claimed` boolean NOT NULL DEFAULT false,
	`claimedAt` datetime(3),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RankedUserRewards_id` PRIMARY KEY(`id`)
);

CREATE TABLE `RecruitmentRewards` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`type` enum('MONEY','REPUTATION','PRESTIGE','CLAN_POINTS') NOT NULL,
	`recruitedUserId` varchar(191) NOT NULL,
	`amount` int NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RecruitmentRewards_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ReferralSource` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`source` varchar(191) NOT NULL,
	CONSTRAINT `ReferralSource_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ReportLog` (
	`id` varchar(191) NOT NULL,
	`targetUserId` varchar(191),
	`staffUserId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`action` varchar(191) NOT NULL,
	CONSTRAINT `ReportLog_id` PRIMARY KEY(`id`)
);

CREATE TABLE `RyoTrade` (
	`id` varchar(191) NOT NULL,
	`creatorUserId` varchar(191) NOT NULL,
	`repsForSale` int NOT NULL,
	`requestedRyo` bigint NOT NULL,
	`ryoPerRep` double NOT NULL,
	`purchaserUserId` varchar(191),
	`allowedPurchaserId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `RyoTrade_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Sector` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sector` smallint NOT NULL,
	`villageId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`shrineLevel` tinyint NOT NULL DEFAULT 1,
	`capturedAt` datetime(3),
	`nextMaintainanceDueDate` datetime(3),
	CONSTRAINT `Sector_id` PRIMARY KEY(`id`),
	CONSTRAINT `Sector_sector_key` UNIQUE(`sector`)
);

CREATE TABLE `ShrineBoostSchedule` (
	`id` varchar(191) NOT NULL,
	`villageId` varchar(191) NOT NULL,
	`boostType` enum('Training','PVP','Mission','Errands','Crafting') NOT NULL,
	`startAt` datetime(3) NOT NULL,
	`endAt` datetime(3) NOT NULL,
	`createdByUserId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `ShrineBoostSchedule_id` PRIMARY KEY(`id`)
);

CREATE TABLE `SkillTree` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`effects` json NOT NULL,
	`target` enum('SELF','ENEMIES','ALLIES') NOT NULL DEFAULT 'SELF',
	`tier` tinyint NOT NULL DEFAULT 1,
	`requiredSkillIds` json NOT NULL DEFAULT ('[]'),
	`costSkillPoints` int NOT NULL DEFAULT 1,
	`hidden` boolean NOT NULL DEFAULT false,
	`skillType` enum('DEFAULT','SPECIAL') NOT NULL DEFAULT 'DEFAULT',
	`folderId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `SkillTree_id` PRIMARY KEY(`id`),
	CONSTRAINT `SkillTree_name_key` UNIQUE(`name`)
);

CREATE TABLE `SkillTreeFolder` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(512) NOT NULL DEFAULT '',
	`description` text,
	`hidden` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `SkillTreeFolder_id` PRIMARY KEY(`id`)
);

CREATE TABLE `StaffApplication` (
	`id` varchar(191) NOT NULL,
	`applicantUserId` varchar(191) NOT NULL,
	`targetRole` enum('USER','CODING-ADMIN','CONTENT-ADMIN','EVENT-ADMIN','MODERATOR-ADMIN','HEAD_MODERATOR','MODERATOR','JR_MODERATOR','CONTENT','EVENT','CODER') NOT NULL,
	`state` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`conversationId` varchar(191) NOT NULL,
	`motivation` text,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `StaffApplication_id` PRIMARY KEY(`id`)
);

CREATE TABLE `StaffApplicationApproval` (
	`id` varchar(191) NOT NULL,
	`applicationId` varchar(191) NOT NULL,
	`approverUserId` varchar(191) NOT NULL,
	`group` enum('EVENT-ADMIN','CODING-ADMIN','MODERATOR-ADMIN','CONTENT-ADMIN') NOT NULL,
	`state` enum('APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `StaffApplicationApproval_id` PRIMARY KEY(`id`),
	CONSTRAINT `StaffApplicationApproval_applicationId_group_key` UNIQUE(`applicationId`,`group`),
	CONSTRAINT `StaffApplicationApproval_applicationId_approverUserId_key` UNIQUE(`applicationId`,`approverUserId`)
);

CREATE TABLE `SupportReview` (
	`id` varchar(191) NOT NULL,
	`apiRoute` varchar(191) NOT NULL,
	`chatHistory` json NOT NULL,
	`userId` varchar(191) NOT NULL,
	`sentiment` enum('POSITIVE','NEGATIVE','NEUTRAL') NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `SupportReview_id` PRIMARY KEY(`id`)
);

CREATE TABLE `SupportTicket` (
	`id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('BUG_REPORT','FEATURE_REQUEST','ACCOUNT_ISSUE','GAMEPLAY_QUESTION','PAYMENT_ISSUE','TECHNICAL_SUPPORT','MODERATION_SUPPORT','OTHER') NOT NULL,
	`priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
	`status` enum('OPEN','IN_PROGRESS','WAITING_FOR_USER','WAITING_FOR_STAFF','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
	`isPublic` boolean NOT NULL DEFAULT false,
	`tags` json NOT NULL DEFAULT ('[]'),
	`conversationId` varchar(191) NOT NULL,
	`createdByUserId` varchar(191) NOT NULL,
	`assignedToUserId` varchar(191),
	`githubIssueUrl` varchar(500),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`closedAt` datetime(3),
	CONSTRAINT `SupportTicket_id` PRIMARY KEY(`id`)
);

CREATE TABLE `SupportTicketActivity` (
	`id` varchar(191) NOT NULL,
	`ticketId` varchar(191) NOT NULL,
	`authorId` varchar(191) NOT NULL,
	`action` enum('CREATED','UPDATED','ASSIGNED','UNASSIGNED','STATUS_CHANGED','PRIORITY_CHANGED','CATEGORY_CHANGED','TAGGED','UNTAGGED','MERGED','ESCALATED_TO_GITHUB','COMMENTED','CLOSED','REOPENED') NOT NULL,
	`oldValue` text,
	`newValue` text,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `SupportTicketActivity_id` PRIMARY KEY(`id`)
);

CREATE TABLE `Tournament` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`round` tinyint NOT NULL DEFAULT 1,
	`type` enum('CLAN') NOT NULL,
	`rewards` json NOT NULL,
	`startedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 1 DAY ),
	`roundStartedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 1 DAY ),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`status` enum('OPEN','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'OPEN',
	CONSTRAINT `Tournament_id` PRIMARY KEY(`id`),
	CONSTRAINT `Tournament_name_key` UNIQUE(`name`)
);

CREATE TABLE `TournamentMatch` (
	`id` varchar(191) NOT NULL,
	`tournamentId` varchar(191) NOT NULL,
	`round` int NOT NULL,
	`match` int NOT NULL,
	`state` enum('WAITING','PLAYED','NO_SHOW') NOT NULL DEFAULT 'WAITING',
	`winnerId` varchar(191),
	`battleId` varchar(191),
	`userId1` varchar(191) NOT NULL,
	`userId2` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`startedAt` datetime(3) NOT NULL,
	CONSTRAINT `TournamentMatch_id` PRIMARY KEY(`id`)
);

CREATE TABLE `TournamentRecord` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`image` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`round` tinyint NOT NULL DEFAULT 1,
	`type` enum('CLAN') NOT NULL,
	`rewards` json NOT NULL,
	`startedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 1 DAY ),
	`winnerId` varchar(191),
	CONSTRAINT `TournamentRecord_id` PRIMARY KEY(`id`),
	CONSTRAINT `HistoricalTournament_name_key` UNIQUE(`name`)
);

CREATE TABLE `TowerDefenseCharacter` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`isPlayer` boolean NOT NULL DEFAULT false,
	`baseHealth` int NOT NULL DEFAULT 10,
	`baseSpeed` double NOT NULL DEFAULT 0.4,
	`baseDamage` int NOT NULL DEFAULT 10,
	`attackCooldown` double NOT NULL DEFAULT 1,
	`healthScaling` double NOT NULL DEFAULT 0.15,
	`speedScaling` double NOT NULL DEFAULT 0.02,
	`damageScaling` double NOT NULL DEFAULT 2,
	`firstAppearWave` int NOT NULL DEFAULT 1,
	`baseCount` int NOT NULL DEFAULT 3,
	`countScaling` double NOT NULL DEFAULT 1.5,
	`scaleFactor` double NOT NULL DEFAULT 2.8,
	`assetConfig` json DEFAULT ('null'),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `TowerDefenseCharacter_id` PRIMARY KEY(`id`)
);

CREATE TABLE `TowerDefenseRun` (
	`id` varchar(191) NOT NULL,
	`seed` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`startedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`endedAt` datetime(3),
	`wave` int NOT NULL DEFAULT 0,
	`score` int NOT NULL DEFAULT 0,
	`gridSize` int NOT NULL DEFAULT 5,
	`status` enum('ACTIVE','COMPLETED','ABANDONED') NOT NULL DEFAULT 'ACTIVE',
	`state` json NOT NULL,
	CONSTRAINT `TowerDefenseRun_id` PRIMARY KEY(`id`)
);

CREATE TABLE `TowerDefenseUpgrade` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`maxLevel` int NOT NULL DEFAULT 10,
	`baseCost` int NOT NULL DEFAULT 100,
	`costMultiplier` double NOT NULL DEFAULT 1.5,
	`upgradeType` enum('DAMAGE','ATTACK_SPEED','RANGE','CRIT_CHANCE','DAMAGE_PER_TILE','HEALTH','HEALTH_REGEN','DEFENSE_PERCENT','DEFENSE_FLAT','LIFESTEAL','KNOCKBACK_CHANCE','KNOCKBACK_FORCE','TOKENS_PER_WAVE','TOKENS_PER_KILL','INTEREST_PER_WAVE','SKIP_ENEMY_CHANCE','ABILITY_UNLOCK') NOT NULL,
	`effectValue` double NOT NULL DEFAULT 0.1,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `TowerDefenseUpgrade_id` PRIMARY KEY(`id`)
);

CREATE TABLE `TrainingLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(191) NOT NULL,
	`amount` double NOT NULL,
	`stat` enum('ninjutsuOffence','taijutsuOffence','genjutsuOffence','bukijutsuOffence','ninjutsuDefence','taijutsuDefence','genjutsuDefence','bukijutsuDefence','intelligence','speed','willpower','strength'),
	`speed` enum('15min','1hr','4hrs','8hrs','12hrs','24hrs'),
	`trainingFinishedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `TrainingLog_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UsersInConversation` (
	`conversationId` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`assignedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`lastReadAt` datetime(3),
	CONSTRAINT `UsersInConversation_conversationId_userId_pk` PRIMARY KEY(`conversationId`,`userId`)
);

CREATE TABLE `UserActivityEvent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(191) NOT NULL,
	`streak` int NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserActivityEvent_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserAssociation` (
	`id` varchar(191) NOT NULL,
	`userOne` varchar(191) NOT NULL,
	`userTwo` varchar(191) NOT NULL,
	`associationType` enum('MARRIAGE','DIVORCED') NOT NULL DEFAULT 'MARRIAGE',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserAssociation_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserOne_UserTwo_UserAssociation_key` UNIQUE(`userOne`,`userTwo`,`associationType`)
);

CREATE TABLE `UserAttribute` (
	`id` varchar(191) NOT NULL,
	`attribute` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	CONSTRAINT `UserAttribute_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserAttribute_attribute_userId_key` UNIQUE(`attribute`,`userId`)
);

CREATE TABLE `UserBadge` (
	`userId` varchar(191) NOT NULL,
	`badgeId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3))
);

CREATE TABLE `UserBlackList` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorUserId` varchar(191) NOT NULL,
	`targetUserId` varchar(191) NOT NULL,
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserBlackList_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserData` (
	`userId` varchar(191) NOT NULL,
	`recruiterId` varchar(191),
	`anbuId` varchar(191),
	`clanId` varchar(191),
	`jutsuLoadout` varchar(191),
	`itemLoadout` varchar(191),
	`rankedLoadout` varchar(191),
	`nRecruited` int NOT NULL DEFAULT 0,
	`lastIp` varchar(191),
	`username` varchar(191) NOT NULL,
	`gender` varchar(191) NOT NULL,
	`curHealth` smallint unsigned NOT NULL DEFAULT 100,
	`maxHealth` smallint unsigned NOT NULL DEFAULT 100,
	`curChakra` smallint unsigned NOT NULL DEFAULT 100,
	`maxChakra` smallint unsigned NOT NULL DEFAULT 100,
	`curStamina` smallint unsigned NOT NULL DEFAULT 100,
	`maxStamina` smallint unsigned NOT NULL DEFAULT 100,
	`regeneration` tinyint NOT NULL DEFAULT 60,
	`money` bigint NOT NULL DEFAULT 1000,
	`bank` bigint NOT NULL DEFAULT 1000,
	`experience` int NOT NULL DEFAULT 0,
	`earnedExperience` int NOT NULL DEFAULT 2000,
	`rank` enum('STUDENT','GENIN','CHUNIN','JONIN','ELITE JONIN','ELDER','NONE') NOT NULL DEFAULT 'STUDENT',
	`isOutlaw` boolean NOT NULL DEFAULT false,
	`level` int NOT NULL DEFAULT 1,
	`villageId` varchar(191),
	`bloodlineId` varchar(191),
	`bloodlineReskinId` varchar(191),
	`status` enum('AWAKE','HOSPITALIZED','TRAVEL','BATTLE','QUEUED','KAGE_QUEUED','ASLEEP') NOT NULL DEFAULT 'AWAKE',
	`strength` double NOT NULL DEFAULT 10,
	`intelligence` double NOT NULL DEFAULT 10,
	`willpower` double NOT NULL DEFAULT 10,
	`speed` double NOT NULL DEFAULT 10,
	`ninjutsuOffence` double NOT NULL DEFAULT 10,
	`ninjutsuDefence` double NOT NULL DEFAULT 10,
	`genjutsuOffence` double NOT NULL DEFAULT 10,
	`genjutsuDefence` double NOT NULL DEFAULT 10,
	`taijutsuOffence` double NOT NULL DEFAULT 10,
	`taijutsuDefence` double NOT NULL DEFAULT 10,
	`bukijutsuDefence` double NOT NULL DEFAULT 10,
	`bukijutsuOffence` double NOT NULL DEFAULT 10,
	`statsMultiplier` double NOT NULL DEFAULT 1,
	`poolsMultiplier` double NOT NULL DEFAULT 1,
	`primaryElement` enum('Fire','Water','Wind','Earth','Lightning','Ice','Crystal','Dust','Shadow','Wood','Scorch','Storm','Magnet','Yin-Yang','Lava','Explosion','Light','Boil','Metal','Sand','None'),
	`secondaryElement` enum('Fire','Water','Wind','Earth','Lightning','Ice','Crystal','Dust','Shadow','Wood','Scorch','Storm','Magnet','Yin-Yang','Lava','Explosion','Light','Boil','Metal','Sand','None'),
	`reputationPoints` float NOT NULL DEFAULT 11,
	`reputationPointsTotal` float NOT NULL DEFAULT 11,
	`seichiSilver` int NOT NULL DEFAULT 0,
	`villagePrestige` float NOT NULL DEFAULT 0,
	`federalStatus` enum('NONE','NORMAL','SILVER','GOLD') NOT NULL DEFAULT 'NONE',
	`approvedTos` boolean NOT NULL DEFAULT false,
	`avatar` varchar(191),
	`avatarLight` varchar(191),
	`avatar3d` varchar(191),
	`sector` smallint unsigned NOT NULL DEFAULT 0,
	`longitude` tinyint NOT NULL DEFAULT 10,
	`latitude` tinyint NOT NULL DEFAULT 7,
	`location` varchar(191) DEFAULT '',
	`joinedVillageAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3) - INTERVAL 7 DAY),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`questFinishAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`deletionAt` datetime(3),
	`travelFinishAt` datetime(3),
	`isBanned` boolean NOT NULL DEFAULT false,
	`isSilenced` boolean NOT NULL DEFAULT false,
	`isWarned` boolean NOT NULL DEFAULT false,
	`isTradeBanned` boolean NOT NULL DEFAULT false,
	`role` enum('USER','CODING-ADMIN','CONTENT-ADMIN','EVENT-ADMIN','MODERATOR-ADMIN','HEAD_MODERATOR','MODERATOR','JR_MODERATOR','CONTENT','EVENT','CODER') NOT NULL DEFAULT 'USER',
	`battleId` varchar(191),
	`isAi` boolean NOT NULL DEFAULT false,
	`isSummon` boolean NOT NULL DEFAULT false,
	`isEvent` boolean NOT NULL DEFAULT false,
	`inShrines` boolean NOT NULL DEFAULT false,
	`inArena` boolean NOT NULL DEFAULT false,
	`inboxNews` int NOT NULL DEFAULT 0,
	`regenAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`immunityUntil` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`robImmunityUntil` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`trainingStartedAt` datetime(3),
	`trainingSpeed` enum('15min','1hr','4hrs','8hrs','12hrs','24hrs') NOT NULL DEFAULT '15min',
	`currentlyTraining` enum('ninjutsuOffence','taijutsuOffence','genjutsuOffence','bukijutsuOffence','ninjutsuDefence','taijutsuDefence','genjutsuDefence','bukijutsuDefence','intelligence','speed','willpower','strength'),
	`unreadNotifications` smallint NOT NULL DEFAULT 0,
	`unreadNews` smallint NOT NULL DEFAULT 0,
	`questData` json,
	`senseiId` varchar(191),
	`medicalExperience` int NOT NULL DEFAULT 0,
	`craftingExperience` int NOT NULL DEFAULT 0,
	`huntingExperience` int NOT NULL DEFAULT 0,
	`gatheringExperience` int NOT NULL DEFAULT 0,
	`preferredStat` enum('Highest','Ninjutsu','Genjutsu','Taijutsu','Bukijutsu'),
	`preferredGeneral1` enum('Highest','Strength','Intelligence','Willpower','Speed'),
	`preferredGeneral2` enum('Highest','Strength','Intelligence','Willpower','Speed'),
	`showBattleDescription` boolean NOT NULL DEFAULT true,
	`pvpFights` int NOT NULL DEFAULT 0,
	`pveFights` int NOT NULL DEFAULT 0,
	`pvpActivity` int NOT NULL DEFAULT 0,
	`pvpStreak` smallint unsigned NOT NULL DEFAULT 0,
	`errands` smallint unsigned NOT NULL DEFAULT 0,
	`missionsD` smallint unsigned NOT NULL DEFAULT 0,
	`missionsC` smallint unsigned NOT NULL DEFAULT 0,
	`missionsB` smallint unsigned NOT NULL DEFAULT 0,
	`missionsA` smallint unsigned NOT NULL DEFAULT 0,
	`missionsS` smallint unsigned NOT NULL DEFAULT 0,
	`missionsH` smallint unsigned NOT NULL DEFAULT 0,
	`crimesD` smallint unsigned NOT NULL DEFAULT 0,
	`crimesC` smallint unsigned NOT NULL DEFAULT 0,
	`crimesB` smallint unsigned NOT NULL DEFAULT 0,
	`crimesA` smallint unsigned NOT NULL DEFAULT 0,
	`crimesS` smallint unsigned NOT NULL DEFAULT 0,
	`crimesH` smallint unsigned NOT NULL DEFAULT 0,
	`dailyArenaFights` smallint unsigned NOT NULL DEFAULT 0,
	`dailyMissions` smallint unsigned NOT NULL DEFAULT 0,
	`dailyErrands` smallint unsigned NOT NULL DEFAULT 0,
	`dailyMedicalMissions` smallint unsigned NOT NULL DEFAULT 0,
	`dailyPvpMissions` smallint unsigned NOT NULL DEFAULT 0,
	`dailyTrainings` smallint unsigned NOT NULL DEFAULT 0,
	`movedTooFastCount` int NOT NULL DEFAULT 0,
	`extraItemSlots` smallint unsigned NOT NULL DEFAULT 0,
	`extraJutsuSlots` tinyint unsigned NOT NULL DEFAULT 0,
	`extraReskinSlots` tinyint NOT NULL DEFAULT 2,
	`customTitle` varchar(191) NOT NULL DEFAULT '',
	`marriageSlots` int unsigned NOT NULL DEFAULT 1,
	`aiProfileId` varchar(191),
	`effects` json NOT NULL DEFAULT ('[]'),
	`openaiCalls` int NOT NULL DEFAULT 0,
	`tavernMessages` int NOT NULL DEFAULT 0,
	`musicOn` boolean NOT NULL DEFAULT true,
	`sfxOn` boolean NOT NULL DEFAULT true,
	`iframesMuted` boolean NOT NULL DEFAULT false,
	`tutorialStep` tinyint unsigned NOT NULL DEFAULT 0,
	`tutorialOn` boolean NOT NULL DEFAULT true,
	`homeType` enum('NONE','STUDIO_APARTMENT','ONE_BED_APARTMENT','TWO_BED_HOUSE','TOWN_HOUSE','SMALL_MANSION','SMALL_ESTATE','LARGE_ESTATE','PALACE','MARSHMALLOWOPOLIS') NOT NULL DEFAULT 'NONE',
	`staffAccount` boolean NOT NULL DEFAULT false,
	`rankedLp` int NOT NULL DEFAULT 0,
	`rankedBattles` int NOT NULL DEFAULT 0,
	`rankedWins` int NOT NULL DEFAULT 0,
	`rankedStreak` int NOT NULL DEFAULT 0,
	`skillPoints` int NOT NULL DEFAULT 0,
	`towerDefensePoints` int NOT NULL DEFAULT 0,
	`occupation` enum('GATHERING','HUNTER','CRAFTING'),
	`occupationSignupAt` datetime(3),
	`stealth` double NOT NULL DEFAULT 1000,
	`sensory` double NOT NULL DEFAULT 1000,
	`stealthActive` boolean NOT NULL DEFAULT false,
	`stealthActivatedAt` datetime(3),
	`stealthCooldownAt` datetime(3),
	`lastSensoryAt` datetime(3),
	`covertTrainingType` enum('stealth','sensory'),
	`covertTrainingStartedAt` datetime(3),
	`covertTrainingMinutes` smallint unsigned,
	CONSTRAINT `UserData_userId` PRIMARY KEY(`userId`),
	CONSTRAINT `UserData_username_key` UNIQUE(`username`)
);

CREATE TABLE `UserItem` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`itemId` varchar(191) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`equipped` enum('HEAD','CHEST','LEGS','FEET','HAND_1','HAND_2','THROWN','WAIST','KEYSTONE','ITEM_1','ITEM_2','ITEM_3','ITEM_4','ITEM_5','ITEM_6','NONE') NOT NULL DEFAULT 'NONE',
	`durability` smallint unsigned NOT NULL DEFAULT 100,
	`storedAtHome` boolean NOT NULL DEFAULT false,
	`craftingFinishedAt` datetime(3),
	`isInAuction` boolean NOT NULL DEFAULT false,
	`dropChancePerc` smallint unsigned NOT NULL DEFAULT 0,
	CONSTRAINT `UserItem_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserItemImbuement` (
	`id` varchar(191) NOT NULL,
	`userItemId` varchar(191) NOT NULL,
	`imbuementItemId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`craftingFinishedAt` datetime(3) NOT NULL,
	CONSTRAINT `UserItemImbuement_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserItemImbuement_userItem_imbuement_key` UNIQUE(`userItemId`,`imbuementItemId`)
);

CREATE TABLE `UserJutsu` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`jutsuId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`level` int NOT NULL DEFAULT 1,
	`experience` int NOT NULL DEFAULT 0,
	`equipped` boolean NOT NULL DEFAULT false,
	`finishTraining` datetime(3),
	`reskinId` varchar(191),
	CONSTRAINT `UserJutsu_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserJutsu_userId_jutsuId_key` UNIQUE(`userId`,`jutsuId`)
);

CREATE TABLE `UserLikes` (
	`type` enum('like','love','laugh') NOT NULL,
	`userId` varchar(191) NOT NULL,
	`imageId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3))
);

CREATE TABLE `UserNindo` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`content` text NOT NULL,
	CONSTRAINT `UserNindo_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserPollVote` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`pollId` varchar(191) NOT NULL,
	`optionId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserPollVote_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserPollVote_userId_pollId_idx` UNIQUE(`userId`,`pollId`)
);

CREATE TABLE `UserRaidBuff` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`questId` varchar(191) NOT NULL,
	`effects` json NOT NULL DEFAULT ('[]'),
	`expiresAt` datetime(3) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserRaidBuff_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserReport` (
	`id` varchar(191) NOT NULL,
	`reporterUserId` varchar(191),
	`reportedUserId` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`system` varchar(191) NOT NULL,
	`infraction` json NOT NULL,
	`reason` text NOT NULL,
	`banEnd` datetime(3),
	`adminResolved` boolean NOT NULL DEFAULT false,
	`status` enum('UNVIEWED','REPORT_CLEARED','BAN_ACTIVATED','SILENCE_ACTIVATED','BAN_ESCALATED','SILENCE_ESCALATED','OFFICIAL_WARNING','TRADE_BAN_ACTIVATED') NOT NULL DEFAULT 'UNVIEWED',
	`aiInterpretation` text NOT NULL,
	`predictedStatus` enum('UNVIEWED','REPORT_CLEARED','BAN_ACTIVATED','SILENCE_ACTIVATED','BAN_ESCALATED','SILENCE_ESCALATED','OFFICIAL_WARNING','TRADE_BAN_ACTIVATED'),
	`additionalContext` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `UserReport_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserReportComment` (
	`id` varchar(191) NOT NULL,
	`content` text NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`userId` varchar(191) NOT NULL,
	`reportId` varchar(191) NOT NULL,
	`decision` enum('UNVIEWED','REPORT_CLEARED','BAN_ACTIVATED','SILENCE_ACTIVATED','BAN_ESCALATED','SILENCE_ESCALATED','OFFICIAL_WARNING','TRADE_BAN_ACTIVATED'),
	`isReported` boolean NOT NULL DEFAULT false,
	CONSTRAINT `UserReportComment_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserRequest` (
	`id` varchar(191) NOT NULL,
	`senderId` varchar(191) NOT NULL,
	`receiverId` varchar(191) NOT NULL,
	`status` enum('PENDING','ACCEPTED','REJECTED','CANCELLED','EXPIRED') NOT NULL,
	`type` enum('SPAR','ALLIANCE','SURRENDER','SENSEI','ANBU','CLAN','MARRIAGE','KAGE','WAR_ALLY') NOT NULL,
	`value` int DEFAULT 0,
	`relatedId` varchar(191),
	`useRankedRules` boolean DEFAULT false,
	`spectatable` boolean DEFAULT false,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserRequest_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserReview` (
	`id` varchar(191) NOT NULL,
	`authorUserId` varchar(191) NOT NULL,
	`targetUserId` varchar(191) NOT NULL,
	`positive` boolean NOT NULL DEFAULT true,
	`review` text NOT NULL,
	`authorIp` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserReview_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserRewards` (
	`id` varchar(191) NOT NULL,
	`awardedById` varchar(191) NOT NULL,
	`receiverId` varchar(191) NOT NULL,
	`reputationAmount` float NOT NULL DEFAULT 0,
	`moneyAmount` bigint NOT NULL DEFAULT 0,
	`reason` text NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserRewards_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserSkill` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`skillId` varchar(191) NOT NULL,
	`purchasedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`activated` boolean NOT NULL DEFAULT true,
	CONSTRAINT `UserSkill_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserSkill_userId_skillId_key` UNIQUE(`userId`,`skillId`)
);

CREATE TABLE `UserStreakProgress` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`configId` varchar(191) NOT NULL,
	`currentDay` int NOT NULL DEFAULT 0,
	`lastClaimDate` datetime(3),
	`startedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserStreakProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserStreakProgress_userId_configId_key` UNIQUE(`userId`,`configId`)
);

CREATE TABLE `UserTowerDefenseUpgrade` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`upgradeId` varchar(191) NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`purchasedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserTowerDefenseUpgrade_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserTowerDefenseUpgrade_userId_upgradeId_key` UNIQUE(`userId`,`upgradeId`)
);

CREATE TABLE `UserUpload` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`imageUrl` varchar(255) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserUpload_id` PRIMARY KEY(`id`)
);

CREATE TABLE `UserVote` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`topWebGames` boolean NOT NULL DEFAULT false,
	`top100Arena` boolean NOT NULL DEFAULT false,
	`mmoHub` boolean NOT NULL DEFAULT false,
	`arenaTop100` boolean NOT NULL DEFAULT false,
	`xtremeTop100` boolean NOT NULL DEFAULT false,
	`topOnlineMmorpg` boolean NOT NULL DEFAULT false,
	`browserMmorpg` boolean NOT NULL DEFAULT false,
	`apexWebGaming` boolean NOT NULL DEFAULT false,
	`bbogd` boolean NOT NULL DEFAULT false,
	`claimed` boolean NOT NULL DEFAULT false,
	`totalClaims` int NOT NULL DEFAULT 0,
	`secret` varchar(191) NOT NULL,
	`lastVoteAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `UserVote_id` PRIMARY KEY(`id`),
	CONSTRAINT `UserVote_userId_idx` UNIQUE(`userId`)
);

CREATE TABLE `Village` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`mapName` varchar(191),
	`sector` int NOT NULL DEFAULT 1,
	`description` varchar(512) NOT NULL DEFAULT '',
	`kageId` varchar(191) NOT NULL,
	`tokens` int NOT NULL DEFAULT 0,
	`type` enum('VILLAGE','OUTLAW','SAFEZONE','HIDEOUT','TOWN') NOT NULL DEFAULT 'VILLAGE',
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`leaderUpdatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`hexColor` varchar(191) NOT NULL DEFAULT '#000000',
	`populationCount` int NOT NULL DEFAULT 0,
	`allianceSystem` boolean NOT NULL DEFAULT true,
	`joinable` boolean NOT NULL DEFAULT true,
	`pvpDisabled` boolean NOT NULL DEFAULT false,
	`villageLogo` varchar(191) NOT NULL DEFAULT '',
	`villageGraphic` varchar(191) NOT NULL DEFAULT '',
	`lastMaintenancePaidAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`wasDowngraded` boolean NOT NULL DEFAULT false,
	`openForChallenges` boolean NOT NULL DEFAULT true,
	`openForChallengesAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`wallpaperOverwrite` varchar(191),
	`warExhaustionEndedAt` datetime(3),
	`lastWarEndedAt` datetime(3),
	`shrineSettings` json NOT NULL DEFAULT ('{"unlockedAiIds":[],"activeBoosts":{},"activeAiIds":[]}'),
	CONSTRAINT `Village_id` PRIMARY KEY(`id`),
	CONSTRAINT `Village_name_key` UNIQUE(`name`),
	CONSTRAINT `Village_sector_key` UNIQUE(`sector`)
);

CREATE TABLE `VillageAlliance` (
	`id` varchar(191) NOT NULL,
	`villageIdA` varchar(191) NOT NULL,
	`villageIdB` varchar(191) NOT NULL,
	`status` enum('NEUTRAL','ALLY','ENEMY') NOT NULL,
	`updatedAt` datetime(3),
	`createdAt` datetime(3),
	CONSTRAINT `VillageAlliance_id` PRIMARY KEY(`id`)
);

CREATE TABLE `VillageStructure` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`route` varchar(191) NOT NULL DEFAULT '',
	`image` varchar(191) NOT NULL,
	`villageId` varchar(191) NOT NULL,
	`longitude` tinyint NOT NULL DEFAULT 10,
	`latitude` tinyint NOT NULL DEFAULT 10,
	`hasPage` tinyint NOT NULL DEFAULT 0,
	`curSp` int NOT NULL DEFAULT 100,
	`maxSp` int NOT NULL DEFAULT 100,
	`allyAccess` tinyint NOT NULL DEFAULT 1,
	`showInVillagePage` boolean NOT NULL DEFAULT true,
	`baseCost` int NOT NULL DEFAULT 10000,
	`level` int NOT NULL DEFAULT 1,
	`maxLevel` int NOT NULL DEFAULT 10,
	`lastUpgradedAt` datetime(3),
	`anbuSquadsPerLvl` tinyint NOT NULL DEFAULT 0,
	`arenaRewardPerLvl` tinyint NOT NULL DEFAULT 0,
	`bankInterestPerLvl` tinyint NOT NULL DEFAULT 0,
	`blackDiscountPerLvl` tinyint NOT NULL DEFAULT 0,
	`clansPerLvl` tinyint NOT NULL DEFAULT 0,
	`hospitalSpeedupPerLvl` tinyint NOT NULL DEFAULT 0,
	`itemDiscountPerLvl` tinyint NOT NULL DEFAULT 0,
	`patrolsPerLvl` tinyint NOT NULL DEFAULT 0,
	`ramenDiscountPerLvl` tinyint NOT NULL DEFAULT 0,
	`regenIncreasePerLvl` tinyint NOT NULL DEFAULT 0,
	`sleepRegenPerLvl` tinyint NOT NULL DEFAULT 0,
	`structureDiscountPerLvl` tinyint NOT NULL DEFAULT 0,
	`trainBoostPerLvl` tinyint NOT NULL DEFAULT 0,
	`villageDefencePerLvl` tinyint NOT NULL DEFAULT 0,
	`temporaryLevelBonus` int NOT NULL DEFAULT 0,
	`temporaryLevelBonusExpiresAt` datetime(3),
	CONSTRAINT `VillageStructure_id` PRIMARY KEY(`id`),
	CONSTRAINT `VillageStructure_name_villageId_key` UNIQUE(`name`,`villageId`)
);

CREATE TABLE `VisitorLog` (
	`id` varchar(191) NOT NULL,
	`ip` varchar(191) NOT NULL,
	`ref` varchar(191),
	`utmSource` varchar(191),
	`userAgent` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `VisitorLog_id` PRIMARY KEY(`id`),
	CONSTRAINT `VisitorLog_ip_key` UNIQUE(`ip`)
);

CREATE TABLE `War` (
	`id` varchar(191) NOT NULL,
	`attackerVillageId` varchar(191) NOT NULL,
	`defenderVillageId` varchar(191) NOT NULL,
	`startedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`endedAt` datetime(3),
	`status` enum('ACTIVE','ATTACKER_VICTORY','DEFENDER_VICTORY','DRAW') NOT NULL,
	`type` enum('VILLAGE_WAR','SECTOR_WAR','WAR_RAID') NOT NULL,
	`sector` smallint NOT NULL DEFAULT 0,
	`attackerShrineHp` smallint NOT NULL DEFAULT 1000,
	`attackerShrineMaxHp` smallint NOT NULL DEFAULT 1000,
	`attackerShrineStatus` enum('ACTIVE','CAPTURED') NOT NULL DEFAULT 'ACTIVE',
	`defenderShrineHp` smallint NOT NULL DEFAULT 3000,
	`defenderShrineMaxHp` smallint NOT NULL DEFAULT 3000,
	`defenderShrineStatus` enum('ACTIVE','CAPTURED') NOT NULL DEFAULT 'ACTIVE',
	`lastTokenReductionAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`targetStructureRoute` varchar(191) NOT NULL DEFAULT '/townhall',
	`attackerWarHealth` int NOT NULL DEFAULT 10000,
	`defenderWarHealth` int NOT NULL DEFAULT 10000,
	`attackerWarHealthMax` int NOT NULL DEFAULT 10000,
	`defenderWarHealthMax` int NOT NULL DEFAULT 10000,
	CONSTRAINT `War_id` PRIMARY KEY(`id`)
);

CREATE TABLE `WarAlly` (
	`id` varchar(191) NOT NULL,
	`warId` varchar(191) NOT NULL,
	`villageId` varchar(191) NOT NULL,
	`supportVillageId` varchar(191) NOT NULL,
	`tokensPaid` int NOT NULL,
	`joinedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `WarAlly_id` PRIMARY KEY(`id`)
);

CREATE TABLE `WarKill` (
	`id` varchar(191) NOT NULL,
	`warId` varchar(191) NOT NULL,
	`killerId` varchar(191) NOT NULL,
	`victimId` varchar(191) NOT NULL,
	`killerVillageId` varchar(191) NOT NULL,
	`victimVillageId` varchar(191) NOT NULL,
	`sector` smallint NOT NULL DEFAULT 1337,
	`shrineHpChange` smallint NOT NULL DEFAULT 1337,
	`townhallHpChange` smallint NOT NULL DEFAULT 1337,
	`killedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `WarKill_id` PRIMARY KEY(`id`)
);

CREATE INDEX `AbEvent_userId_idx` ON `AbEvent` (`userId`);
CREATE INDEX `AbEvent_experiment_idx` ON `AbEvent` (`experiment`);
CREATE INDEX `AbEvent_event_idx` ON `AbEvent` (`event`);
CREATE INDEX `AbEvent_source_idx` ON `AbEvent` (`source`);
CREATE INDEX `AbEvent_createdAt_idx` ON `AbEvent` (`createdAt`);
CREATE INDEX `ActionLog_userId_idx` ON `ActionLog` (`userId`);
CREATE INDEX `ActionLog_relatedId_idx` ON `ActionLog` (`relatedId`);
CREATE INDEX `ActionLog_tableName_idx` ON `ActionLog` (`tableName`);
CREATE INDEX `ActionLog_createdAt_idx` ON `ActionLog` (`createdAt`);
CREATE INDEX `ActivityStreakReward_configId_idx` ON `ActivityStreakReward` (`configId`);
CREATE INDEX `ActivityStreakReward_dayNumber_idx` ON `ActivityStreakReward` (`dayNumber`);
CREATE INDEX `AnbuSquad_leaderId_idx` ON `AnbuSquad` (`leaderId`);
CREATE INDEX `AnbuSquad_villageId_idx` ON `AnbuSquad` (`villageId`);
CREATE INDEX `AuctionBid_auctionId_idx` ON `AuctionBid` (`auctionId`);
CREATE INDEX `AuctionBid_bidderId_idx` ON `AuctionBid` (`bidderId`);
CREATE INDEX `AuctionBid_amount_idx` ON `AuctionBid` (`amount`);
CREATE INDEX `AuctionListing_sellerId_idx` ON `AuctionListing` (`sellerId`);
CREATE INDEX `AuctionListing_buyerId_idx` ON `AuctionListing` (`buyerId`);
CREATE INDEX `AuctionListing_userItemId_idx` ON `AuctionListing` (`userItemId`);
CREATE INDEX `AuctionListing_targetUserId_idx` ON `AuctionListing` (`targetUserId`);
CREATE INDEX `AuctionListing_status_idx` ON `AuctionListing` (`status`);
CREATE INDEX `AuctionListing_expiresAt_idx` ON `AuctionListing` (`expiresAt`);
CREATE INDEX `AutoMod_userId_idx` ON `AutomatedModeration` (`userId`);
CREATE INDEX `AutoMod_relationType_idx` ON `AutomatedModeration` (`relationType`);
CREATE INDEX `BankTransfers_senderId_idx` ON `BankTransfers` (`senderId`);
CREATE INDEX `BankTransfers_receiverId_idx` ON `BankTransfers` (`receiverId`);
CREATE INDEX `BankTransfers_senderId_receiverId_idx` ON `BankTransfers` (`senderId`,`receiverId`);
CREATE INDEX `BankTransfers_createdAt_idx` ON `BankTransfers` (`createdAt`);
CREATE INDEX `Battle_battleType_createdAt_idx` ON `Battle` (`battleType`,`createdAt`);
CREATE INDEX `BattleAction_createdAt_idx` ON `BattleAction` (`createdAt`);
CREATE INDEX `BattleAction_battleId_idx` ON `BattleAction` (`battleId`);
CREATE INDEX `BattleHistory_createdAt_idx` ON `BattleHistory` (`createdAt`);
CREATE INDEX `BattleHistory_battleId_idx` ON `BattleHistory` (`battleId`);
CREATE INDEX `BattleHistory_battleType_idx` ON `BattleHistory` (`battleType`);
CREATE INDEX `BattleHistory_attackedId_idx` ON `BattleHistory` (`attackedId`);
CREATE INDEX `BattleHistory_defenderId_idx` ON `BattleHistory` (`defenderId`);
CREATE INDEX `Bloodline_image_key` ON `Bloodline` (`image`);
CREATE INDEX `Bloodline_village_idx` ON `Bloodline` (`villageId`);
CREATE INDEX `Bloodline_rank_idx` ON `Bloodline` (`rank`);
CREATE INDEX `Bloodline_difficulty_idx` ON `Bloodline` (`difficulty`);
CREATE INDEX `BloodlineReskin_bloodlineId_idx` ON `BloodlineReskin` (`bloodlineId`);
CREATE INDEX `BloodlineReskin_createdBy_idx` ON `BloodlineReskin` (`createdBy`);
CREATE INDEX `BloodlineRolls_userId_idx` ON `BloodlineRolls` (`userId`);
CREATE INDEX `BloodlineRolls_bloodlineId_idx` ON `BloodlineRolls` (`bloodlineId`);
CREATE INDEX `Bounty_targetUserId_idx` ON `Bounty` (`targetUserId`);
CREATE INDEX `Bounty_creatorUserId_idx` ON `Bounty` (`creatorUserId`);
CREATE INDEX `Bounty_status_idx` ON `Bounty` (`status`);
CREATE INDEX `BountyContribution_bountyId_idx` ON `BountyContribution` (`bountyId`);
CREATE INDEX `BountyContribution_contributorUserId_idx` ON `BountyContribution` (`contributorUserId`);
CREATE INDEX `BountySignup_bountyId_idx` ON `BountySignup` (`bountyId`);
CREATE INDEX `BountySignup_hunterUserId_idx` ON `BountySignup` (`hunterUserId`);
CREATE INDEX `CannedResponse_createdByUserId_idx` ON `CannedResponse` (`createdByUserId`);
CREATE INDEX `CannedResponse_title_idx` ON `CannedResponse` (`title`);
CREATE INDEX `Captcha_userId_key` ON `Captcha` (`userId`);
CREATE INDEX `Captcha_used_idx` ON `Captcha` (`used`);
CREATE INDEX `Clan_village_idx` ON `Clan` (`villageId`);
CREATE INDEX `image_done_idx` ON `ConceptImage` (`done`);
CREATE INDEX `image_userId_idx` ON `ConceptImage` (`userId`);
CREATE INDEX `ContentBackup_type_idx` ON `ContentBackup` (`type`);
CREATE INDEX `ContentBackup_createdAt_idx` ON `ContentBackup` (`createdAt`);
CREATE INDEX `Conversation_title_key` ON `Conversation` (`title`);
CREATE INDEX `Conversation_createdById_idx` ON `Conversation` (`createdById`);
CREATE INDEX `ConversationComment_userId_idx` ON `ConversationComment` (`userId`);
CREATE INDEX `ConversationComment_createdAt_idx` ON `ConversationComment` (`createdAt`);
CREATE INDEX `ConversationComment_conversationId_idx` ON `ConversationComment` (`conversationId`);
CREATE INDEX `CraftingRequirement_craftItemId_idx` ON `CraftingRequirement` (`craftItemId`);
CREATE INDEX `CraftingRequirement_requirementItemId_idx` ON `CraftingRequirement` (`requirementItemId`);
CREATE INDEX `DailyBankInterest_userId_idx` ON `DailyBankInterest` (`userId`);
CREATE INDEX `DamageCalculation_userId_idx` ON `DamageCalculation` (`userId`);
CREATE INDEX `DamageCalculation_createdAt_idx` ON `DamageCalculation` (`createdAt`);
CREATE INDEX `DataBattleActions_type_idx` ON `DataBattleAction` (`type`);
CREATE INDEX `DataBattleActions_battleWon_idx` ON `DataBattleAction` (`battleWon`);
CREATE INDEX `DataBattleActions_battleType_idx` ON `DataBattleAction` (`battleType`);
CREATE INDEX `DataBattleActions_contentId_idx` ON `DataBattleAction` (`contentId`);
CREATE INDEX `DataBattleActions_count_idx` ON `DataBattleAction` (`count`);
CREATE INDEX `DataBattleActions_createdAt` ON `DataBattleAction` (`createdAt`);
CREATE INDEX `EmailReminder_userId_idx` ON `EmailReminder` (`userId`);
CREATE INDEX `ForumPost_userId_idx` ON `ForumPost` (`userId`);
CREATE INDEX `ForumPost_threadId_idx` ON `ForumPost` (`threadId`);
CREATE INDEX `ForumThread_boardId_idx` ON `ForumThread` (`boardId`);
CREATE INDEX `ForumThread_userId_idx` ON `ForumThread` (`userId`);
CREATE INDEX `GameAsset_type_idx` ON `GameAsset` (`type`);
CREATE INDEX `name` ON `GameSetting` (`name`);
CREATE INDEX `HistoricalAvatar_done_idx` ON `HistoricalAvatar` (`done`);
CREATE INDEX `HistoricalAvatar_status_idx` ON `HistoricalAvatar` (`status`);
CREATE INDEX `HistoricalAvatar_userId_idx` ON `HistoricalAvatar` (`userId`);
CREATE INDEX `HistoricalIp_userId_idx` ON `HistoricalIp` (`userId`);
CREATE INDEX `HistoricalIp_userIp_idx` ON `HistoricalIp` (`ip`);
CREATE INDEX `HistoricalSoundEffect_replicateId_idx` ON `HistoricalSoundEffect` (`replicateId`);
CREATE INDEX `HistoricalSoundEffect_relationId_idx` ON `HistoricalSoundEffect` (`relationId`);
CREATE INDEX `HistoricalSoundEffect_userId_idx` ON `HistoricalSoundEffect` (`userId`);
CREATE INDEX `HistoricalSoundEffect_done_idx` ON `HistoricalSoundEffect` (`done`);
CREATE INDEX `HistoricalSoundEffect_status_idx` ON `HistoricalSoundEffect` (`status`);
CREATE INDEX `Item_rarity_idx` ON `Item` (`rarity`);
CREATE INDEX `Item_itemType_idx` ON `Item` (`itemType`);
CREATE INDEX `Item_slot_idx` ON `Item` (`slot`);
CREATE INDEX `Item_method_idx` ON `Item` (`method`);
CREATE INDEX `Item_target_idx` ON `Item` (`target`);
CREATE INDEX `Item_isEventItem_idx` ON `Item` (`isEventItem`);
CREATE INDEX `Item_onlyInShop_idx` ON `Item` (`inShop`);
CREATE INDEX `Item_cost_idx` ON `Item` (`cost`);
CREATE INDEX `Item_repsCost_idx` ON `Item` (`reputationCost`);
CREATE INDEX `Item_requiredLevel_idx` ON `Item` (`requiredLevel`);
CREATE INDEX `Item_bloodlineId_idx` ON `Item` (`bloodlineId`);
CREATE INDEX `ItemLoadout_userId_idx` ON `ItemLoadout` (`userId`);
CREATE INDEX `Jutsu_image_key` ON `Jutsu` (`image`);
CREATE INDEX `Jutsu_bloodlineId_idx` ON `Jutsu` (`bloodlineId`);
CREATE INDEX `Jutsu_villageId_idx` ON `Jutsu` (`villageId`);
CREATE INDEX `Jutsu_injectable_idx` ON `Jutsu` (`injectableInBattle`);
CREATE INDEX `JutsuLoadout_userId_idx` ON `JutsuLoadout` (`userId`);
CREATE INDEX `JutsuReskin_userId_idx` ON `JutsuReskin` (`userId`);
CREATE INDEX `JutsuReskin_jutsuId_idx` ON `JutsuReskin` (`jutsuId`);
CREATE INDEX `VillageKageChallenges_villageId_idx` ON `KageDefendedChallenges` (`villageId`);
CREATE INDEX `VillageKageChallenges_userId_idx` ON `KageDefendedChallenges` (`userId`);
CREATE INDEX `VillageKageChallenges_kageID_idx` ON `KageDefendedChallenges` (`kageId`);
CREATE INDEX `LinkPromotion_userId_idx` ON `LinkPromotion` (`userId`);
CREATE INDEX `LinkPromotion_reviewedBy_idx` ON `LinkPromotion` (`reviewedBy`);
CREATE INDEX `LogBattleLengths_battleType_idx` ON `LogTimeDurations` (`battleType`);
CREATE INDEX `MpvpBattleQueue_battleId_idx` ON `MpvpBattleQueue` (`battleId`);
CREATE INDEX `MpvpBattleQueue_winnerId_idx` ON `MpvpBattleQueue` (`winnerId`);
CREATE INDEX `MpvpBattleQueue_battleType_idx` ON `MpvpBattleQueue` (`battleType`);
CREATE INDEX `MpvpBattleQueue_sector_idx` ON `MpvpBattleQueue` (`sector`);
CREATE INDEX `MpvpBattleQueue_attackerEntityId_idx` ON `MpvpBattleQueue` (`attackerEntityId`);
CREATE INDEX `MpvpBattleQueue_defenderEntityId_idx` ON `MpvpBattleQueue` (`defenderEntityId`);
CREATE INDEX `MpvpBattleUser_clanBattleId_idx` ON `MpvpBattleUser` (`clanBattleId`);
CREATE INDEX `MpvpBattleUser_userId_idx` ON `MpvpBattleUser` (`userId`);
CREATE INDEX `MpvpBattleUser_side_idx` ON `MpvpBattleUser` (`side`);
CREATE INDEX `Notification_createdAt_idx` ON `Notification` (`createdAt`);
CREATE INDEX `PaypalSubscription_createdById_idx` ON `PaypalSubscription` (`createdById`);
CREATE INDEX `PaypalSubscription_affectedUserId_idx` ON `PaypalSubscription` (`affectedUserId`);
CREATE INDEX `PaypalTransaction_createdById_idx` ON `PaypalTransaction` (`createdById`);
CREATE INDEX `PaypalTransaction_transactionId_idx` ON `PaypalTransaction` (`transactionId`);
CREATE INDEX `PaypalTransaction_invoiceId_idx` ON `PaypalTransaction` (`invoiceId`);
CREATE INDEX `PaypalTransaction_affectedUserId_idx` ON `PaypalTransaction` (`affectedUserId`);
CREATE INDEX `PaypalTransaction_reputationPoints_idx` ON `PaypalTransaction` (`reputationPoints`);
CREATE INDEX `PaypalTransaction_type_idx` ON `PaypalTransaction` (`type`);
CREATE INDEX `PaypalTransaction_amount_idx` ON `PaypalTransaction` (`amount`);
CREATE INDEX `Poll_createdByUserId_idx` ON `Poll` (`createdByUserId`);
CREATE INDEX `Poll_isActive_idx` ON `Poll` (`isActive`);
CREATE INDEX `Poll_endDate_idx` ON `Poll` (`endDate`);
CREATE INDEX `PollOption_pollId_idx` ON `PollOption` (`pollId`);
CREATE INDEX `PollOption_createdByUserId_idx` ON `PollOption` (`createdByUserId`);
CREATE INDEX `PollOption_targetUserId_idx` ON `PollOption` (`targetUserId`);
CREATE INDEX `Quest_questType_idx` ON `Quest` (`questType`);
CREATE INDEX `Quest_questRank_idx` ON `Quest` (`questRank`);
CREATE INDEX `Quest_requiredLevel_idx` ON `Quest` (`requiredLevel`);
CREATE INDEX `Quest_maxLevel_idx` ON `Quest` (`maxLevel`);
CREATE INDEX `Quest_requiredVillage_idx` ON `Quest` (`requiredVillage`);
CREATE INDEX `Quest_requiredBloodline_idx` ON `Quest` (`requiredBloodlineId`);
CREATE INDEX `Quest_endsAt_idx` ON `Quest` (`endsAt`);
CREATE INDEX `Quest_startsAt_idx` ON `Quest` (`startsAt`);
CREATE INDEX `Quest_prerequisiteQuestId_idx` ON `Quest` (`prerequisiteQuestId`);
CREATE INDEX `Quest_questType_questRank_requiredLevel_idx` ON `Quest` (`questType`,`questRank`,`requiredLevel`);
CREATE INDEX `Quest_raidEndsAt_idx` ON `Quest` (`raidEndsAt`);
CREATE INDEX `QuestHistory_userId_idx` ON `QuestHistory` (`userId`);
CREATE INDEX `QuestHistory_questType_idx` ON `QuestHistory` (`questType`);
CREATE INDEX `QuestHistory_endedAt_idx` ON `QuestHistory` (`endedAt`);
CREATE INDEX `QuestHistory_questId_idx` ON `QuestHistory` (`questId`);
CREATE INDEX `QuestHistory_completed_idx` ON `QuestHistory` (`completed`);
CREATE INDEX `QuestHistory_userId_completed_idx` ON `QuestHistory` (`userId`,`completed`);
CREATE INDEX `QuestHistory_userId_questType_idx` ON `QuestHistory` (`userId`,`questType`);
CREATE INDEX `QuestHistory_questId_userId_completed_idx` ON `QuestHistory` (`questId`,`userId`,`completed`);
CREATE INDEX `RaidDamageThreshold_questId_idx` ON `RaidDamageThreshold` (`questId`);
CREATE INDEX `RaidDamageThreshold_sortOrder_idx` ON `RaidDamageThreshold` (`sortOrder`);
CREATE INDEX `RaidParticipation_questId_idx` ON `RaidParticipation` (`questId`);
CREATE INDEX `RaidParticipation_userId_idx` ON `RaidParticipation` (`userId`);
CREATE INDEX `RaidParticipation_damageDealt_idx` ON `RaidParticipation` (`damageDealt`);
CREATE INDEX `RaidParticipation_questId_damageDealt_idx` ON `RaidParticipation` (`questId`,`damageDealt`);
CREATE INDEX `RankedPvpQueue_userId_idx` ON `RankedPvpQueue` (`userId`);
CREATE INDEX `RankedPvpQueue_rankedLp_idx` ON `RankedPvpQueue` (`rankedLp`);
CREATE INDEX `RecruitmentRewards_userId_idx` ON `RecruitmentRewards` (`userId`);
CREATE INDEX `RecruitmentRewards_recruitedUserId_idx` ON `RecruitmentRewards` (`recruitedUserId`);
CREATE INDEX `RecruitmentRewards_type_idx` ON `RecruitmentRewards` (`type`);
CREATE INDEX `ReferralSource_userId_idx` ON `ReferralSource` (`userId`);
CREATE INDEX `ReferralSource_source_idx` ON `ReferralSource` (`source`);
CREATE INDEX `ReportLog_targetUserId_idx` ON `ReportLog` (`targetUserId`);
CREATE INDEX `ReportLog_staffUserId_idx` ON `ReportLog` (`staffUserId`);
CREATE INDEX `RyoTrade_creatorUserId_idx` ON `RyoTrade` (`creatorUserId`);
CREATE INDEX `ShrineBoostSchedule_villageId_idx` ON `ShrineBoostSchedule` (`villageId`);
CREATE INDEX `ShrineBoostSchedule_boostType_idx` ON `ShrineBoostSchedule` (`boostType`);
CREATE INDEX `ShrineBoostSchedule_startAt_idx` ON `ShrineBoostSchedule` (`startAt`);
CREATE INDEX `ShrineBoostSchedule_endAt_idx` ON `ShrineBoostSchedule` (`endAt`);
CREATE INDEX `SkillTree_tier_idx` ON `SkillTree` (`tier`);
CREATE INDEX `SkillTree_hidden_idx` ON `SkillTree` (`hidden`);
CREATE INDEX `SkillTree_skillType_idx` ON `SkillTree` (`skillType`);
CREATE INDEX `SkillTree_folderId_idx` ON `SkillTree` (`folderId`);
CREATE INDEX `SkillTreeFolder_name_idx` ON `SkillTreeFolder` (`name`);
CREATE INDEX `SkillTreeFolder_order_idx` ON `SkillTreeFolder` (`order`);
CREATE INDEX `SkillTreeFolder_hidden_idx` ON `SkillTreeFolder` (`hidden`);
CREATE INDEX `StaffApplication_applicantUserId_idx` ON `StaffApplication` (`applicantUserId`);
CREATE INDEX `StaffApplication_targetRole_idx` ON `StaffApplication` (`targetRole`);
CREATE INDEX `StaffApplication_state_idx` ON `StaffApplication` (`state`);
CREATE INDEX `StaffApplication_createdAt_idx` ON `StaffApplication` (`createdAt`);
CREATE INDEX `StaffApplicationApproval_applicationId_idx` ON `StaffApplicationApproval` (`applicationId`);
CREATE INDEX `StaffApplicationApproval_approverUserId_idx` ON `StaffApplicationApproval` (`approverUserId`);
CREATE INDEX `SupportTicket_createdByUserId_idx` ON `SupportTicket` (`createdByUserId`);
CREATE INDEX `SupportTicket_assignedToUserId_idx` ON `SupportTicket` (`assignedToUserId`);
CREATE INDEX `SupportTicket_status_idx` ON `SupportTicket` (`status`);
CREATE INDEX `SupportTicket_category_idx` ON `SupportTicket` (`category`);
CREATE INDEX `SupportTicket_priority_idx` ON `SupportTicket` (`priority`);
CREATE INDEX `SupportTicket_isPublic_idx` ON `SupportTicket` (`isPublic`);
CREATE INDEX `SupportTicket_createdAt_idx` ON `SupportTicket` (`createdAt`);
CREATE INDEX `SupportTicketActivity_ticketId_idx` ON `SupportTicketActivity` (`ticketId`);
CREATE INDEX `SupportTicketActivity_authorId_idx` ON `SupportTicketActivity` (`authorId`);
CREATE INDEX `SupportTicketActivity_action_idx` ON `SupportTicketActivity` (`action`);
CREATE INDEX `SupportTicketActivity_createdAt_idx` ON `SupportTicketActivity` (`createdAt`);
CREATE INDEX `TournamentMatch_tournamentId_idx` ON `TournamentMatch` (`tournamentId`);
CREATE INDEX `TournamentMatch_userId1_idx` ON `TournamentMatch` (`userId1`);
CREATE INDEX `TournamentMatch_userId2_idx` ON `TournamentMatch` (`userId2`);
CREATE INDEX `TournamentMatch_winnerId_idx` ON `TournamentMatch` (`winnerId`);
CREATE INDEX `TowerDefenseCharacter_name_idx` ON `TowerDefenseCharacter` (`name`);
CREATE INDEX `TowerDefenseCharacter_firstAppearWave_idx` ON `TowerDefenseCharacter` (`firstAppearWave`);
CREATE INDEX `TowerDefenseCharacter_isPlayer_idx` ON `TowerDefenseCharacter` (`isPlayer`);
CREATE INDEX `TowerDefenseRun_userId_idx` ON `TowerDefenseRun` (`userId`);
CREATE INDEX `TowerDefenseRun_status_idx` ON `TowerDefenseRun` (`status`);
CREATE INDEX `TowerDefenseRun_userId_status_idx` ON `TowerDefenseRun` (`userId`,`status`);
CREATE INDEX `TowerDefenseRun_score_idx` ON `TowerDefenseRun` (`score`);
CREATE INDEX `TowerDefenseRun_startedAt_idx` ON `TowerDefenseRun` (`startedAt`);
CREATE INDEX `TowerDefenseUpgrade_name_idx` ON `TowerDefenseUpgrade` (`name`);
CREATE INDEX `TowerDefenseUpgrade_upgradeType_idx` ON `TowerDefenseUpgrade` (`upgradeType`);
CREATE INDEX `TrainingLog_userId_idx` ON `TrainingLog` (`userId`);
CREATE INDEX `TrainingLog_speed_idx` ON `TrainingLog` (`speed`);
CREATE INDEX `TrainingLog_stat_idx` ON `TrainingLog` (`stat`);
CREATE INDEX `TrainingLog_trainingFinishedAt_idx` ON `TrainingLog` (`trainingFinishedAt`);
CREATE INDEX `UsersInConversation_userId_idx` ON `UsersInConversation` (`userId`);
CREATE INDEX `UserAttribute_userOne_idx` ON `UserAssociation` (`userOne`);
CREATE INDEX `UserAttribute_userTwo_idx` ON `UserAssociation` (`userTwo`);
CREATE INDEX `UserAttribute_userId_idx` ON `UserAttribute` (`userId`);
CREATE INDEX `UserBadge_userId_idx` ON `UserBadge` (`userId`);
CREATE INDEX `UserBadge_badgeId_idx` ON `UserBadge` (`badgeId`);
CREATE INDEX `BlackList_creatorUserId_idx` ON `UserBlackList` (`creatorUserId`);
CREATE INDEX `BlackList_targetUserId_idx` ON `UserBlackList` (`targetUserId`);
CREATE INDEX `UserData_isAi_idx` ON `UserData` (`isAi`);
CREATE INDEX `UserData_isAi_rankedLp_experience_idx` ON `UserData` (`isAi`,`rankedLp`,`experience`);
CREATE INDEX `UserData_isEvent_idx` ON `UserData` (`isEvent`);
CREATE INDEX `UserData_inArena_idx` ON `UserData` (`inArena`);
CREATE INDEX `UserData_inShrines_idx` ON `UserData` (`inShrines`);
CREATE INDEX `UserData_isSummon_idx` ON `UserData` (`isSummon`);
CREATE INDEX `UserData_rank_idx` ON `UserData` (`rank`);
CREATE INDEX `UserData_role_idx` ON `UserData` (`role`);
CREATE INDEX `UserData_clanId_idx` ON `UserData` (`clanId`);
CREATE INDEX `UserData_anbuId_idx` ON `UserData` (`anbuId`);
CREATE INDEX `UserData_jutsuLoadout_idx` ON `UserData` (`jutsuLoadout`);
CREATE INDEX `UserData_rankedLoadout_idx` ON `UserData` (`rankedLoadout`);
CREATE INDEX `UserData_rankedLp_idx` ON `UserData` (`rankedLp`);
CREATE INDEX `UserData_experience_idx` ON `UserData` (`experience`);
CREATE INDEX `UserData_level_idx` ON `UserData` (`level`);
CREATE INDEX `UserData_bloodlineId_idx` ON `UserData` (`bloodlineId`);
CREATE INDEX `UserData_bloodlineReskinId_idx` ON `UserData` (`bloodlineReskinId`);
CREATE INDEX `UserData_villageId_idx` ON `UserData` (`villageId`);
CREATE INDEX `UserData_battleId_idx` ON `UserData` (`battleId`);
CREATE INDEX `UserData_status_idx` ON `UserData` (`status`);
CREATE INDEX `UserData_sector_idx` ON `UserData` (`sector`);
CREATE INDEX `UserData_sector_stealthActive_idx` ON `UserData` (`sector`,`stealthActive`);
CREATE INDEX `UserData_senseiId_idx` ON `UserData` (`senseiId`);
CREATE INDEX `UserData_latitude_idx` ON `UserData` (`latitude`);
CREATE INDEX `UserData_longitude_idx` ON `UserData` (`longitude`);
CREATE INDEX `UserData_createdAt_idx` ON `UserData` (`createdAt`);
CREATE INDEX `UserItem_userId_idx` ON `UserItem` (`userId`);
CREATE INDEX `UserItem_itemId_idx` ON `UserItem` (`itemId`);
CREATE INDEX `UserItem_quantity_idx` ON `UserItem` (`quantity`);
CREATE INDEX `UserItem_equipped_idx` ON `UserItem` (`equipped`);
CREATE INDEX `UserItem_userId_equipped_idx` ON `UserItem` (`userId`,`equipped`);
CREATE INDEX `UserItemImbuement_userItemId_idx` ON `UserItemImbuement` (`userItemId`);
CREATE INDEX `UserItemImbuement_imbuementItemId_idx` ON `UserItemImbuement` (`imbuementItemId`);
CREATE INDEX `UserJutsu_jutsuId_idx` ON `UserJutsu` (`jutsuId`);
CREATE INDEX `Jutsu_equipped_idx` ON `UserJutsu` (`equipped`);
CREATE INDEX `UserJutsu_reskinId_idx` ON `UserJutsu` (`reskinId`);
CREATE INDEX `userLikes_userId_idx` ON `UserLikes` (`userId`);
CREATE INDEX `userLikes_imageId_idx` ON `UserLikes` (`imageId`);
CREATE INDEX `UserNindo_userId_idx` ON `UserNindo` (`userId`);
CREATE INDEX `UserPollVote_userId_idx` ON `UserPollVote` (`userId`);
CREATE INDEX `UserPollVote_pollId_idx` ON `UserPollVote` (`pollId`);
CREATE INDEX `UserPollVote_optionId_idx` ON `UserPollVote` (`optionId`);
CREATE INDEX `UserRaidBuff_userId_idx` ON `UserRaidBuff` (`userId`);
CREATE INDEX `UserRaidBuff_questId_idx` ON `UserRaidBuff` (`questId`);
CREATE INDEX `UserRaidBuff_expiresAt_idx` ON `UserRaidBuff` (`expiresAt`);
CREATE INDEX `UserRaidBuff_userId_expiresAt_idx` ON `UserRaidBuff` (`userId`,`expiresAt`);
CREATE INDEX `UserReport_reporterUserId_idx` ON `UserReport` (`reporterUserId`);
CREATE INDEX `UserReport_reportedUserId_idx` ON `UserReport` (`reportedUserId`);
CREATE INDEX `UserReport_status_idx` ON `UserReport` (`status`);
CREATE INDEX `UserReportComment_userId_idx` ON `UserReportComment` (`userId`);
CREATE INDEX `UserReportComment_reportId_idx` ON `UserReportComment` (`reportId`);
CREATE INDEX `UserRequest_createdAt_idx` ON `UserRequest` (`createdAt`);
CREATE INDEX `UserRequest_senderId_idx` ON `UserRequest` (`senderId`);
CREATE INDEX `UserRequest_receiverId_idx` ON `UserRequest` (`receiverId`);
CREATE INDEX `UserRequest_type_idx` ON `UserRequest` (`type`);
CREATE INDEX `UserReview_authorUserId_idx` ON `UserReview` (`authorUserId`);
CREATE INDEX `UserReview_targetUserId_idx` ON `UserReview` (`targetUserId`);
CREATE INDEX `UserRewards_awardedById_idx` ON `UserRewards` (`awardedById`);
CREATE INDEX `UserRewards_receiverId_idx` ON `UserRewards` (`receiverId`);
CREATE INDEX `UserRewards_createdAt_idx` ON `UserRewards` (`createdAt`);
CREATE INDEX `UserSkill_userId_idx` ON `UserSkill` (`userId`);
CREATE INDEX `UserSkill_skillId_idx` ON `UserSkill` (`skillId`);
CREATE INDEX `UserStreakProgress_userId_idx` ON `UserStreakProgress` (`userId`);
CREATE INDEX `UserStreakProgress_configId_idx` ON `UserStreakProgress` (`configId`);
CREATE INDEX `UserTowerDefenseUpgrade_userId_idx` ON `UserTowerDefenseUpgrade` (`userId`);
CREATE INDEX `UserTowerDefenseUpgrade_upgradeId_idx` ON `UserTowerDefenseUpgrade` (`upgradeId`);
CREATE INDEX `UserUpload_userId_idx` ON `UserUpload` (`userId`);
CREATE INDEX `VillageAlliance_villageIdA_idx` ON `VillageAlliance` (`villageIdA`);
CREATE INDEX `VillageAlliance_villageIdB_idx` ON `VillageAlliance` (`villageIdB`);
CREATE INDEX `VillageAlliance_status_idx` ON `VillageAlliance` (`status`);
CREATE INDEX `VillageStructure_villageId_idx` ON `VillageStructure` (`villageId`);
CREATE INDEX `VisitorLog_ref_idx` ON `VisitorLog` (`ref`);
CREATE INDEX `VisitorLog_utmSource_idx` ON `VisitorLog` (`utmSource`);
CREATE INDEX `VisitorLog_createdAt_idx` ON `VisitorLog` (`createdAt`);
CREATE INDEX `VisitorLog_ip_utmSource_idx` ON `VisitorLog` (`ip`,`utmSource`);
CREATE INDEX `War_attackerVillageId_idx` ON `War` (`attackerVillageId`);
CREATE INDEX `War_defenderVillageId_idx` ON `War` (`defenderVillageId`);
CREATE INDEX `War_sector_idx` ON `War` (`sector`);
CREATE INDEX `War_status_idx` ON `War` (`status`);
CREATE INDEX `WarAlly_warId_idx` ON `WarAlly` (`warId`);
CREATE INDEX `WarAlly_villageId_idx` ON `WarAlly` (`villageId`);
CREATE INDEX `WarKill_warId_idx` ON `WarKill` (`warId`);
CREATE INDEX `WarKill_killerId_idx` ON `WarKill` (`killerId`);
CREATE INDEX `WarKill_victimId_idx` ON `WarKill` (`victimId`);
CREATE INDEX `WarKill_killerVillageId_idx` ON `WarKill` (`killerVillageId`);
CREATE INDEX `WarKill_victimVillageId_idx` ON `WarKill` (`victimVillageId`);