-- Operational tables are owned by the outer Worker, not Payload schema push.
CREATE TABLE IF NOT EXISTS sp_system_state (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sp_storage_budget (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bytes INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO sp_storage_budget(id, bytes)
SELECT 1, COALESCE((SELECT SUM(size) FROM quote_files),0) + COALESCE((SELECT SUM(filesize) FROM media),0);
-- Atomic reservations include pending uploads; deletion releases capacity.
-- 7.5 GB budget leaves headroom in the account-wide 10 GB R2 allowance.
CREATE TRIGGER sp_quote_budget_insert BEFORE INSERT ON quote_files BEGIN
  UPDATE sp_storage_budget SET bytes = bytes + NEW.size WHERE id=1;
  SELECT CASE WHEN (SELECT bytes FROM sp_storage_budget WHERE id=1) > 7500000000
    THEN RAISE(ABORT, 'STORAGE_BUDGET_EXCEEDED') END;
END;
CREATE TRIGGER sp_quote_budget_delete AFTER DELETE ON quote_files BEGIN
  UPDATE sp_storage_budget SET bytes = MAX(0, bytes - OLD.size) WHERE id=1;
END;
CREATE TRIGGER sp_quote_budget_update BEFORE UPDATE OF size ON quote_files BEGIN
  UPDATE sp_storage_budget SET bytes = bytes + NEW.size - OLD.size WHERE id=1;
  SELECT CASE WHEN (SELECT bytes FROM sp_storage_budget WHERE id=1) > 7500000000
    THEN RAISE(ABORT, 'STORAGE_BUDGET_EXCEEDED') END;
END;
CREATE TRIGGER sp_media_budget_insert BEFORE INSERT ON media BEGIN
  UPDATE sp_storage_budget SET bytes = bytes + COALESCE(NEW.filesize,0) WHERE id=1;
  SELECT CASE WHEN (SELECT bytes FROM sp_storage_budget WHERE id=1) > 7500000000
    THEN RAISE(ABORT, 'STORAGE_BUDGET_EXCEEDED') END;
END;
CREATE TRIGGER sp_media_budget_update BEFORE UPDATE OF filesize ON media BEGIN
  UPDATE sp_storage_budget SET bytes = bytes + COALESCE(NEW.filesize,0) - COALESCE(OLD.filesize,0) WHERE id=1;
  SELECT CASE WHEN (SELECT bytes FROM sp_storage_budget WHERE id=1) > 7500000000
    THEN RAISE(ABORT, 'STORAGE_BUDGET_EXCEEDED') END;
END;
CREATE TRIGGER sp_media_budget_delete AFTER DELETE ON media BEGIN
  UPDATE sp_storage_budget SET bytes = MAX(0, bytes - COALESCE(OLD.filesize,0)) WHERE id=1;
END;
CREATE INDEX IF NOT EXISTS sp_quote_scan_idx ON quote_files(status, id);
CREATE INDEX IF NOT EXISTS sp_inquiry_retention_idx ON inquiries(status, closed_at, id);
CREATE INDEX IF NOT EXISTS sp_outbox_due_idx ON outbox(state, next_attempt_at);
