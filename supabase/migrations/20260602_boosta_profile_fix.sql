-- Убедиться что таблица существует
CREATE TABLE IF NOT EXISTS boosta_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Пользователь',
  handle TEXT UNIQUE NOT NULL DEFAULT '',
  avatar_url TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  days_active INTEGER NOT NULL DEFAULT 0,
  ghost_proximity_avg INTEGER NOT NULL DEFAULT 0,
  bio TEXT DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE boosta_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public profiles readable" ON boosta_users;
DROP POLICY IF EXISTS "own profile editable" ON boosta_users;

CREATE POLICY "public profiles readable" ON boosta_users
  FOR SELECT USING (visibility != 'private' OR user_id = auth.uid());

CREATE POLICY "own profile editable" ON boosta_users
  FOR ALL USING (user_id = auth.uid());

-- Handle uniqueness fix — разрешить пустые handle временно
CREATE UNIQUE INDEX IF NOT EXISTS boosta_users_handle_unique
  ON boosta_users (handle) WHERE handle != '';
