DROP TABLE `backgroundSchema`;

TRUNCATE Battle;
TRUNCATE BattleAction;
UPDATE UserData a SET a.battleId=NULL, a.status="AWAKE", a.travelFinishAt=NULL WHERE NOT EXISTS (SELECT id FROM Battle b WHERE b.id = a.battleId) AND a.battleId IS NOT NULL;

ALTER TABLE `Battle` MODIFY COLUMN `background` enum('ocean','ground','dessert','ice','arena','default') NOT NULL;
ALTER TABLE `UserData` MODIFY COLUMN `primaryElement` enum('Fire','Water','Wind','Earth','Lightning','Ice','Crystal','Dust','Shadow','Wood','Scorch','Storm','Magnet','Yin-Yang','Lava','Explosion','Light','Boil','Metal','Sand','None');
ALTER TABLE `UserData` MODIFY COLUMN `secondaryElement` enum('Fire','Water','Wind','Earth','Lightning','Ice','Crystal','Dust','Shadow','Wood','Scorch','Storm','Magnet','Yin-Yang','Lava','Explosion','Light','Boil','Metal','Sand','None');
ALTER TABLE `Battle` ADD `width` int DEFAULT 13 NOT NULL;
ALTER TABLE `Battle` ADD `height` int DEFAULT 9 NOT NULL;