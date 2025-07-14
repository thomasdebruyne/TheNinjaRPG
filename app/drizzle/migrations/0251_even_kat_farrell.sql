ALTER TABLE `Item` RENAME COLUMN `craftable` TO `canBeCrafted`;
ALTER TABLE `Item` ADD `canBeHunted` boolean DEFAULT false NOT NULL;
ALTER TABLE `Item` ADD `canBeGathered` boolean DEFAULT false NOT NULL;
ALTER TABLE `UserData` ADD `huntingExperience` int DEFAULT 0 NOT NULL;
ALTER TABLE `UserData` ADD `gatheringExperience` int DEFAULT 0 NOT NULL;