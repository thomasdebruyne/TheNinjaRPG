CREATE TABLE `ContentBackup` (
	`id` varchar(191) NOT NULL,
	`type` enum('bloodline','jutsu','item','ai') NOT NULL,
	`sqlText` mediumtext NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updatedAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `ContentBackup_id` PRIMARY KEY(`id`)
);

CREATE INDEX `ContentBackup_type_idx` ON `ContentBackup` (`type`);
CREATE INDEX `ContentBackup_createdAt_idx` ON `ContentBackup` (`createdAt`);