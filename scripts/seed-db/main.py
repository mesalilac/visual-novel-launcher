import sqlite3
import click
import os
import sys
import faker
import re
import shutil

from pprint import pprint
from pathlib import Path
from random import randint, choice, sample
from PIL import Image, ImageDraw

from entities import timestamp, Tag, VisualNovel, VISUAL_NOVEL_STATUS

ROOT_DIR = Path(__file__).parent.parent.parent

DB_PATH = ROOT_DIR / Path("src-tauri/dev.db")
FAKE_EXE_PATH = Path(__file__).parent / "fake-exe.exe"
TESTING_LIBRARY_PATH = ROOT_DIR / "testing-library"

MS_IN_3_DAYS = 3 * 24 * 60 * 60 * 1000


def is_project_root(dir: Path) -> bool:
    return (
        (dir / "index.html").exists()
        and (dir / "package.json").exists()
        and (dir / "src").exists()
        and (dir / "src-tauri").exists()
    )


def fs_safe(s: str) -> str:
    return re.sub(r"[^\w\s-]", "", s.strip())


def generate_random_cover(width: int, height: int, output_path: Path):
    bg_color = (
        randint(100, 255),
        randint(100, 255),
        randint(100, 255),
    )

    image = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(image)

    num_shapes = randint(15, 30)

    for _ in range(num_shapes):
        shape_color = (
            randint(0, 255),
            randint(0, 255),
            randint(0, 255),
            randint(100, 200),
        )

        x1 = randint(0, width)
        y1 = randint(0, height)
        x2 = x1 + randint(20, 150)
        y2 = y1 + randint(20, 150)

        shape_type = choice(["circle", "rect", "triangle"])

        match shape_type:
            case "circle":
                draw.ellipse([x1, y1, x2, y2], shape_color)

            case "rect":
                draw.rectangle([x1, y1, x2, y2], shape_color)

            case "triangle":
                draw.polygon([x1, y1, x2, y2], shape_color)

    image.save(output_path)
    print(f"Generated cover: {output_path}")


@click.group()
def cli():
    pass


@cli.command()
@click.option(
    "--count",
    "-c",
    required=True,
    type=click.IntRange(0),
    help="Number of visual novels to generate",
)
@click.option(
    "--max-tags",
    "-t",
    required=True,
    type=click.IntRange(0),
    help="Max number of tags to attach to each visual novel",
)
def vns(count: int, max_tags: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    fake = faker.Faker()

    for _ in range(count):
        title = fs_safe(fake.catch_phrase().title())
        description = fake.text(max_nb_chars=200)
        status = choice(VISUAL_NOVEL_STATUS)
        playtime = randint(0, 12000)

        last_time_played_at: int | None = None

        if randint(0, 4) == 0:
            playtime = 0

        if playtime > 0:
            last_time_played_at = timestamp() - randint(0, MS_IN_3_DAYS)
        else:
            status = "Backlog"

        vn_path = TESTING_LIBRARY_PATH / title
        vn_cover_path = vn_path / "cover.png"
        game_exe_path = vn_path / "game.exe"

        vn = VisualNovel(
            title=title,
            description=description,
            cover_path=str(vn_cover_path),
            last_time_played_at=last_time_played_at,
            playtime=playtime,
            status=status,
            dir_path=str(vn_path),
            executable_path=str(game_exe_path),
        )

        try:
            vn.insert(cursor)
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        else:
            pprint(vn)
            if vn_path.exists():
                shutil.rmtree(vn_path)

            os.makedirs(
                vn_path,
            )

            print("-" * 20)
            generate_random_cover(200, 300, vn_cover_path)

            shutil.copyfile(FAKE_EXE_PATH, game_exe_path)

            cursor.execute("SELECT * FROM tags")

            rows = cursor.fetchall()

            tags = sample(rows, randint(0, max_tags))

            print("-" * 20)

            for tag in tags:
                pprint(tag, indent=4)

                try:
                    cursor.execute(
                        "INSERT INTO visual_novels_tags (visual_novel_id, tag_id) VALUES (?, ?)",
                        (vn.id, tag[0]),
                    )
                    conn.commit()
                except sqlite3.IntegrityError:
                    pass

            print("-" * 40)

    cursor.close()


@cli.command()
@click.option(
    "--count",
    "-c",
    required=True,
    type=click.IntRange(0),
    help="Number of tags to generate",
)
def tags(count: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    fake = faker.Faker()

    for _ in range(count):
        tag_name = choice(fake.bs().split(" "))
        tag = Tag(name=tag_name.title())

        try:
            tag.insert(cursor)
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        else:
            pprint(tag)

    cursor.close()


if __name__ == "__main__":
    if not is_project_root(ROOT_DIR):
        print(f"[ERROR]: Not the project root: {ROOT_DIR}")
        sys.exit(1)

    if not DB_PATH.exists():
        print(f"[ERROR]: Database not found at '{DB_PATH}'")
        sys.exit(1)

    if not FAKE_EXE_PATH.exists():
        print(f"[ERROR]: Fake executable not found at '{FAKE_EXE_PATH}'")
        sys.exit(1)

    if not TESTING_LIBRARY_PATH.exists():
        print(f"[INFO]: Created testing library at '{TESTING_LIBRARY_PATH}'")
        os.makedirs(TESTING_LIBRARY_PATH)

    cli()
