ALTER TABLE `Quest` MODIFY COLUMN `questType` enum('mission','crime','event','exam','errand','tier','daily','achievement','story','anbu','medical') NOT NULL;
ALTER TABLE `QuestHistory` MODIFY COLUMN `questType` enum('mission','crime','event','exam','errand','tier','daily','achievement','story','anbu','medical') NOT NULL;
ALTER TABLE `AnbuSquad` ADD `points` int DEFAULT 0 NOT NULL;
ALTER TABLE `AnbuSquad` ADD `espionageLevel` int DEFAULT 0 NOT NULL;
ALTER TABLE `AnbuSquad` ADD `stealthLevel` int DEFAULT 0 NOT NULL;