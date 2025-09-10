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
	`done` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `HistoricalSoundEffect_id` PRIMARY KEY(`id`)
);

ALTER TABLE `GameAsset` MODIFY COLUMN `type` enum('STATIC','ANIMATION','SCENE_BACKGROUND','SCENE_CHARACTER','SFX','MUSIC') NOT NULL;
CREATE INDEX `HistoricalSoundEffect_replicateId_idx` ON `HistoricalSoundEffect` (`replicateId`);
CREATE INDEX `HistoricalSoundEffect_relationId_idx` ON `HistoricalSoundEffect` (`relationId`);
CREATE INDEX `HistoricalSoundEffect_userId_idx` ON `HistoricalSoundEffect` (`userId`);
CREATE INDEX `HistoricalSoundEffect_done_idx` ON `HistoricalSoundEffect` (`done`);
CREATE INDEX `HistoricalSoundEffect_status_idx` ON `HistoricalSoundEffect` (`status`);