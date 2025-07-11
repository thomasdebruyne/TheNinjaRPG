CREATE TABLE `Bounty` (
	`id` varchar(191) NOT NULL,
	`targetUserId` varchar(191) NOT NULL,
	`creatorUserId` varchar(191) NOT NULL,
	`amountRyo` bigint NOT NULL,
	`status` enum('OPEN','CLAIMED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'OPEN',
	`claimedByUserId` varchar(191),
	`collectedAt` datetime(3),
	`claimedAt` datetime(3),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `Bounty_id` PRIMARY KEY(`id`)
);

CREATE TABLE `BountySignup` (
	`id` varchar(191) NOT NULL,
	`bountyId` varchar(191) NOT NULL,
	`hunterUserId` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `BountySignup_id` PRIMARY KEY(`id`),
	CONSTRAINT `BountySignup_bounty_hunter_key` UNIQUE(`bountyId`,`hunterUserId`)
);

ALTER TABLE `Quest` MODIFY COLUMN `medicalRank` enum('NONE','NOVICE','APPRENTICE','MASTER','LEGENDARY') DEFAULT 'NONE';
CREATE INDEX `Bounty_targetUserId_idx` ON `Bounty` (`targetUserId`);
CREATE INDEX `Bounty_creatorUserId_idx` ON `Bounty` (`creatorUserId`);
CREATE INDEX `Bounty_status_idx` ON `Bounty` (`status`);
CREATE INDEX `BountySignup_bountyId_idx` ON `BountySignup` (`bountyId`);
CREATE INDEX `BountySignup_hunterUserId_idx` ON `BountySignup` (`hunterUserId`);