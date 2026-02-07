CREATE TABLE
    visual_novels (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cover_path TEXT,
        playtime BIGINT NOT NULL DEFAULT 0,
        last_time_played_at BIGINT,
        status TEXT NOT NULL CHECK (
            status IN ('Backlog', 'Playing', 'Finished', 'Dropped')
        ) DEFAULT 'Backlog',
        is_favorite BOOLEAN NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        notes TEXT,
        dir_path TEXT NOT NULL UNIQUE,
        executable_path TEXT NOT NULL,
        launch_options TEXT,
        is_missing BOOLEAN NOT NULL DEFAULT 0 CHECK (is_missing IN (0, 1)),
        use_locale_emulator BOOLEAN NOT NULL DEFAULT 1 CHECK (use_locale_emulator IN (0, 1)),
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    tags (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    visual_novels_tags (
        visual_novel_id TEXT NOT NULL REFERENCES visual_novels (id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
        PRIMARY KEY (visual_novel_id, tag_id)
    );

CREATE TABLE
    settings (
        id INT NOT NULL PRIMARY KEY,
        library_path TEXT,
        locale_emulator_executable_path TEXT,
        locale_emulator_launch_options TEXT
    );

CREATE TABLE
    play_sessions (
        id TEXT NOT NULL PRIMARY KEY,
        visual_novel_id TEXT NOT NULL REFERENCES visual_novels (id) ON DELETE CASCADE,
        started_time BIGINT NOT NULL,
        ended_time BIGINT,
        duration_seconds BIGINT
    );

INSERT INTO
    settings (id)
VALUES
    (1);