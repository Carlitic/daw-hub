-- Add score column to user_progress table
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS score numeric;

-- Comment on column
COMMENT ON COLUMN user_progress.score IS 'The grade (0-10) achieved in the content (only for quizzes).';
