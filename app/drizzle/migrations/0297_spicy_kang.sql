CREATE INDEX `Poll_isActive_idx` ON `Poll` (`isActive`);
CREATE INDEX `Poll_endDate_idx` ON `Poll` (`endDate`);
CREATE INDEX `UserPollVote_userId_idx` ON `UserPollVote` (`userId`);