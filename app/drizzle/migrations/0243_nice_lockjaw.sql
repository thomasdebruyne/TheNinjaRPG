-- Custom SQL migration file, put your code below! --
UPDATE `VillageStructure` SET `maxLevel` = 5 WHERE `route` = '/anbu';
UPDATE `VillageStructure` SET `level` = 5 WHERE `route` = '/anbu' AND `level` > 5;

-- Delete all anbuSquads except the top 5 per village based on pvpActivity
DELETE FROM AnbuSquad
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY villageId 
             ORDER BY pvpActivity DESC, id
           ) as rn
    FROM AnbuSquad
  ) AS ranked
  WHERE rn <= 5
); 

-- Remove all users from anbuSquads that are not in the top 5
UPDATE UserData u
LEFT JOIN AnbuSquad a ON u.anbuId = a.id
SET u.anbuId = NULL
WHERE u.anbuId IS NOT NULL 
  AND a.id IS NULL;

-- Remove all users from anbuSquads that are not in the top 4
UPDATE UserData u
SET anbuId = NULL
WHERE anbuId IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 
    FROM (
      SELECT userId, anbuId,
             ROW_NUMBER() OVER (
               PARTITION BY anbuId 
               ORDER BY pvpActivity DESC, level DESC, userId
             ) as rn
      FROM UserData
      WHERE anbuId IS NOT NULL
    ) AS ranked
    WHERE ranked.userId = u.userId 
      AND ranked.anbuId = u.anbuId 
      AND ranked.rn <= 4
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM AnbuSquad a 
    WHERE a.id = u.anbuId 
      AND a.leaderId = u.userId
  );