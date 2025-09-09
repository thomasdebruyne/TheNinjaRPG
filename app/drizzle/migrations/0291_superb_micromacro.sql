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

ALTER TABLE `UserData` ADD `bloodlineReskinId` varchar(191);
ALTER TABLE `UserData` ADD `extraReskinSlots` tinyint DEFAULT 2 NOT NULL;
ALTER TABLE `UserJutsu` ADD `reskinId` varchar(191);
CREATE INDEX `BloodlineReskin_bloodlineId_idx` ON `BloodlineReskin` (`bloodlineId`);
CREATE INDEX `BloodlineReskin_createdBy_idx` ON `BloodlineReskin` (`createdBy`);
CREATE INDEX `JutsuReskin_userId_idx` ON `JutsuReskin` (`userId`);
CREATE INDEX `JutsuReskin_jutsuId_idx` ON `JutsuReskin` (`jutsuId`);
CREATE INDEX `UserData_bloodlineReskinId_idx` ON `UserData` (`bloodlineReskinId`);
CREATE INDEX `UserJutsu_reskinId_idx` ON `UserJutsu` (`reskinId`);