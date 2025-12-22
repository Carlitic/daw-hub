-- Add published column to modules table, default to true (visible)
ALTER TABLE modules ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- Comment
COMMENT ON COLUMN modules.published IS 'If false, module is hidden from users (shows Coming Soon). Admins can still access.';
