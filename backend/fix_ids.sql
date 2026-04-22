-- Fix User IDs: Make them sequential starting from 1
SET FOREIGN_KEY_CHECKS = 0;

-- Reassign user_ids sequentially starting from 1
SET @new_id = 0;
UPDATE users SET user_id = (@new_id := @new_id + 1) ORDER BY user_id ASC;

-- Update related tables to match new user_ids
-- (If you have transactions/notifications referencing user_id, update them too)

-- Reset AUTO_INCREMENT so next new user gets the next sequential number
ALTER TABLE users AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify result
SELECT user_id, name, email, role FROM users ORDER BY user_id;
SELECT 'Done! User IDs are now sequential starting from 1.' AS Status;
