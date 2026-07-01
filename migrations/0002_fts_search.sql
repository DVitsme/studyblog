-- Full-text search over posts (Cloudflare D1 supports the SQLite FTS5 module).
-- External-content table: the index references `posts`, so no body text is duplicated.
-- NOTE: BEGIN/END are UPPERCASE on purpose — D1's remote migration splitter mis-parses lowercase
-- `begin` inside a trigger body (splits on the inner semicolons) and fails only on --remote.
-- See plan/phases/03-public-site.md / the search-research report.

CREATE VIRTUAL TABLE posts_fts USING fts5(
  title,
  excerpt,
  body_md,
  content='posts',
  content_rowid='id',
  tokenize='porter unicode61'
);

-- Keep the index in sync with posts (external-content requires the 'delete' command form).
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, excerpt, body_md)
  VALUES (new.id, new.title, new.excerpt, new.body_md);
END;

CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, body_md)
  VALUES ('delete', old.id, old.title, old.excerpt, old.body_md);
END;

CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, body_md)
  VALUES ('delete', old.id, old.title, old.excerpt, old.body_md);
  INSERT INTO posts_fts(rowid, title, excerpt, body_md)
  VALUES (new.id, new.title, new.excerpt, new.body_md);
END;

-- Populate for any rows that already exist (triggers only fire on future writes).
INSERT INTO posts_fts(posts_fts) VALUES ('rebuild');
