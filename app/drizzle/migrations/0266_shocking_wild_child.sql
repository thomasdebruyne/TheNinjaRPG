CREATE TABLE `LogTimeDurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING') NOT NULL,
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
	`battleType` enum('ARENA','COMBAT','SPARRING','KAGE_AI','KAGE_PVP','CLAN_CHALLENGE','CLAN_BATTLE','SHRINE_WAR','TOURNAMENT','QUEST','RANDOM_ENCOUNTER','VILLAGE_PROTECTOR','TRAINING','RANKED_PVP','RANKED_SPARRING') NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	CONSTRAINT `LogRankedPicks_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniqueContentId` UNIQUE(`type`,`contentId`,`battleType`)
);

ALTER TABLE `TrainingLog` MODIFY COLUMN `stat` enum('ninjutsuOffence','taijutsuOffence','genjutsuOffence','bukijutsuOffence','ninjutsuDefence','taijutsuDefence','genjutsuDefence','bukijutsuDefence','intelligence','speed','willpower','strength');
ALTER TABLE `UserData` MODIFY COLUMN `currentlyTraining` enum('ninjutsuOffence','taijutsuOffence','genjutsuOffence','bukijutsuOffence','ninjutsuDefence','taijutsuDefence','genjutsuDefence','bukijutsuDefence','intelligence','speed','willpower','strength');
CREATE INDEX `LogBattleLengths_battleType_idx` ON `LogTimeDurations` (`battleType`);