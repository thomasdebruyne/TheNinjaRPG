ALTER TABLE `Battle` MODIFY COLUMN `battleType` enum('ARENA','COMBAT','SPARRING','KAGE','QUEST') NOT NULL;
ALTER TABLE `DataBattleAction` MODIFY COLUMN `battleType` enum('ARENA','COMBAT','SPARRING','KAGE','QUEST') NOT NULL;
ALTER TABLE `Village` ADD `isOutlawFaction` tinyint DEFAULT 0 NOT NULL;