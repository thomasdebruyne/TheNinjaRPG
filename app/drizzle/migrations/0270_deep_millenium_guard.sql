ALTER TABLE `Battle` MODIFY COLUMN `extraState` json NOT NULL;
ALTER TABLE `UserItem` ADD `dropChancePerc` smallint unsigned DEFAULT 0 NOT NULL;