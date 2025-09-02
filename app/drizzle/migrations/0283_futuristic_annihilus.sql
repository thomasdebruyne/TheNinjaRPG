CREATE TABLE `AbEvent` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191),
	`experiment` varchar(191) NOT NULL,
	`variant` varchar(191) NOT NULL,
	`event` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	CONSTRAINT `AbEvent_id` PRIMARY KEY(`id`)
);

CREATE INDEX `AbEvent_userId_idx` ON `AbEvent` (`userId`);
CREATE INDEX `AbEvent_experiment_idx` ON `AbEvent` (`experiment`);
CREATE INDEX `AbEvent_event_idx` ON `AbEvent` (`event`);
CREATE INDEX `AbEvent_createdAt_idx` ON `AbEvent` (`createdAt`);