import random
from sqlite3 import Cursor
from time import time
from pydantic import BaseModel, Field
import pynanoid

VISUAL_NOVEL_STATUS: list[str] = ["Backlog", "Playing", "Finished", "Dropped"]

SECONDS_IN_7_DAYS = 7 * 24 * 60 * 60


class VisualNovel(BaseModel):
    id: str = Field(default_factory=pynanoid.generate)
    title: str
    description: str | None = None
    cover_path: str | None
    playtime: int
    last_time_played_at: int | None = None
    status: str
    is_favorite: bool = False
    notes: str | None = None
    dir_path: str
    executable_path: str
    launch_options: str | None = None
    is_missing: bool = False
    use_locale_emulator: bool = True
    created_at: int = Field(
        default_factory=lambda: int(time() - random.randint(0, SECONDS_IN_7_DAYS))
    )

    def insert(self, cursor: Cursor):
        cursor.execute(
            """INSERT INTO visual_novels (
                id, 
                title, 
                description, 
                cover_path, 
                playtime, 
                last_time_played_at, 
                status,
                is_favorite,
                notes,
                dir_path,
                executable_path,
                launch_options,
                is_missing,
                use_locale_emulator,
                created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                self.id,
                self.title,
                self.description,
                self.cover_path,
                self.playtime,
                self.last_time_played_at,
                self.status,
                self.is_favorite,
                self.notes,
                self.dir_path,
                self.executable_path,
                self.launch_options,
                self.is_missing,
                self.use_locale_emulator,
                self.created_at,
            ),
        )


class Tag(BaseModel):
    id: str = Field(default_factory=pynanoid.generate)
    name: str
    created_at: int = Field(
        default_factory=lambda: int(time() - random.randint(0, SECONDS_IN_7_DAYS))
    )

    def insert(self, cursor: Cursor):
        cursor.execute(
            "INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)",
            (self.id, self.name, self.created_at),
        )
