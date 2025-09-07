ALTER TABLE `AbEvent` ADD `ip` varchar(191);
ALTER TABLE `AbEvent` ADD `userAgent` varchar(191);
ALTER TABLE `AbEvent` ADD CONSTRAINT `AbEvent_event_ip_key` UNIQUE(`event`,`ip`);