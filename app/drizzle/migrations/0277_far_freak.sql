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

ALTER TABLE `ConversationComment` MODIFY COLUMN `authorId` varchar(191) NOT NULL;
ALTER TABLE `ForumPost` MODIFY COLUMN `authorId` varchar(191) NOT NULL;
CREATE INDEX `RecruitmentRewards_userId_idx` ON `RecruitmentRewards` (`userId`);
CREATE INDEX `RecruitmentRewards_recruitedUserId_idx` ON `RecruitmentRewards` (`recruitedUserId`);
CREATE INDEX `RecruitmentRewards_type_idx` ON `RecruitmentRewards` (`type`);

-- Migrate bank transfers to recruitment rewards
INSERT INTO `RecruitmentRewards` (`id`, `userId`, `type`, `recruitedUserId`, `amount`, `createdAt`, `updatedAt`)
SELECT
  UUID() AS `id`,
  `receiverId` AS `userId`,
  'MONEY' AS `type`,
  `senderId` AS `recruitedUserId`,
  `amount`,
  `createdAt`,
  `createdAt`
FROM `BankTransfers`
WHERE `type` = 'recruiter';
DELETE FROM `BankTransfers` WHERE `type` = 'recruiter';

-- Migrate paypal transactions to recruitment rewards
INSERT INTO `RecruitmentRewards` (`id`, `userId`, `type`, `recruitedUserId`, `amount`, `createdAt`, `updatedAt`)
SELECT
  `id`,
  `affectedUserId` AS `userId`,
  'REPUTATION' AS `type`,
  `createdById` AS `recruitedUserId`,
  `reputationPoints` AS `amount`,
  `createdAt`,
  `createdAt`
FROM `PaypalTransaction`
WHERE `type` = 'REFERRAL';