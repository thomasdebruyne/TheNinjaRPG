ALTER TABLE `AbEvent` ADD `source` varchar(191);
CREATE INDEX `AbEvent_source_idx` ON `AbEvent` (`source`);