CREATE TABLE `VisitorLog` (
	`id` varchar(191) NOT NULL,
	`ip` varchar(191) NOT NULL,
	`ref` varchar(191),
	`utmSource` varchar(191),
	`userAgent` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `VisitorLog_id` PRIMARY KEY(`id`),
	CONSTRAINT `VisitorLog_ip_key` UNIQUE(`ip`)
);

CREATE INDEX `VisitorLog_ref_idx` ON `VisitorLog` (`ref`);
CREATE INDEX `VisitorLog_utmSource_idx` ON `VisitorLog` (`utmSource`);
CREATE INDEX `VisitorLog_createdAt_idx` ON `VisitorLog` (`createdAt`);