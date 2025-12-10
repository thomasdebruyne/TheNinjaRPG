ALTER TABLE `Quest` MODIFY COLUMN `questType` enum('starter','tier','daily','mission','errand','crime','exam','event','story','anbu','medical','hunting','gathering','battlepyramid','pvp','achievement') NOT NULL;
ALTER TABLE `QuestHistory` MODIFY COLUMN `questType` enum('starter','tier','daily','mission','errand','crime','exam','event','story','anbu','medical','hunting','gathering','battlepyramid','pvp','achievement') NOT NULL;
ALTER TABLE `BattleAction` ADD `actionId` varchar(191) DEFAULT 'unknown' NOT NULL;
ALTER TABLE `BattleAction` ADD `userId` varchar(191) DEFAULT 'unknown' NOT NULL;