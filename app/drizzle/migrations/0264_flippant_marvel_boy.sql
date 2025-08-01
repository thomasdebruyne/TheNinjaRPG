CREATE TABLE `ItemLoadout` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`itemData` json NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `ItemLoadout_id` PRIMARY KEY(`id`)
);

ALTER TABLE `UserData` ADD `itemLoadout` varchar(191);
CREATE INDEX `ItemLoadout_userId_idx` ON `ItemLoadout` (`userId`);