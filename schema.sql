CREATE TABLE IF NOT EXISTS students (
  email TEXT PRIMARY KEY,
  class_name TEXT CHECK (class_name IN ('GS1B','GS1D') OR class_name IS NULL),
  progress_json TEXT NOT NULL DEFAULT '{}',
  onenote_done INTEGER NOT NULL DEFAULT 0,
  digipen_done INTEGER NOT NULL DEFAULT 0,
  scan_done INTEGER NOT NULL DEFAULT 0,
  total_done INTEGER NOT NULL DEFAULT 0,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_last_seen ON students(last_seen);
