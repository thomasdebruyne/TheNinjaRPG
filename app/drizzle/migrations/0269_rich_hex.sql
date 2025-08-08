ALTER TABLE `Battle` ADD `extraState` json;
ALTER TABLE `Jutsu` ADD `injectableInBattle` boolean DEFAULT false NOT NULL;
CREATE INDEX `Jutsu_injectable_idx` ON `Jutsu` (`injectableInBattle`);