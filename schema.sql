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


CREATE TABLE IF NOT EXISTS assignment_settings (
  class_name TEXT NOT NULL,
  track TEXT NOT NULL,
  task_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (class_name, track, task_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_settings_class ON assignment_settings(class_name);

CREATE TABLE IF NOT EXISTS class_today (
  class_name TEXT PRIMARY KEY,
  active INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT 'Heute wichtig',
  message TEXT NOT NULL DEFAULT '',
  tasks_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);
