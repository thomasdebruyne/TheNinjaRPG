-- Remove duplicates in QuestHistory by (userId, questId), keeping only the latest startedAt
DELETE qh1 FROM `QuestHistory` qh1
INNER JOIN `QuestHistory` qh2
  ON qh1.userId = qh2.userId
  AND qh1.questId = qh2.questId
  AND qh1.startedAt < qh2.startedAt;

ALTER TABLE `QuestHistory` ADD CONSTRAINT `uniqueUserIdQuestId` UNIQUE(`userId`,`questId`);