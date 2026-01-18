CREATE TABLE visual_novels (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_path TEXT,
    playtime BIGINT NOT NULL DEFAULT 0,
    last_time_played_at BIGINT,
    status TEXT NOT NULL CHECK (status IN ('Backlog', 'Playing', 'Finished', 'Dropped')) DEFAULT 'Backlog',
    dir_path TEXT NOT NULL UNIQUE,
    executable_path TEXT NOT NULL,
    launch_options TEXT,
    is_missing BOOLEAN NOT NULL DEFAULT 0 CHECK (is_missing IN (0, 1)),

    created_at BIGINT NOT NULL
);

CREATE TABLE tags (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,

    created_at BIGINT NOT NULL
);

CREATE TABLE visual_novels_tags (
    visual_novel_id TEXT NOT NULL REFERENCES visual_novels (id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,

    PRIMARY KEY (visual_novel_id, tag_id)
);

CREATE TABLE settings (
    id INT NOT NULL PRIMARY KEY,
    library_path TEXT,
    locale_emulator_executable_path TEXT,
    locale_emulator_launch_options TEXT
);

INSERT INTO settings (id) VALUES (1);