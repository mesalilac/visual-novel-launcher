import sys
import click

from pathlib import Path
from .logger import logger
from .types import ComponentType
from .tsx import Tsx

BIOME_DISABLE_IMPORT_SORT = (
    "/** biome-ignore-all assist/source/organizeImports: false */\n\n"
)

COMPONENTS_DIR_PATH = Path("src/components")
INDEX_FILE_PATH = COMPONENTS_DIR_PATH / "index.ts"


def toPascalCase(s: str) -> str:
    s = s.strip().lower().replace("-", " ").replace("_", " ")

    return "".join(word.capitalize() for word in s.split())


@click.group()
def cli():
    pass


@cli.command(help="Init components directory")
def init():
    if COMPONENTS_DIR_PATH.exists():
        logger.error(f"Components directory already exists at '{COMPONENTS_DIR_PATH}'")
        return

    confirm = click.confirm(
        f"Do you want to init components directory '{COMPONENTS_DIR_PATH}'?",
        default=True,
    )
    if not confirm:
        return

    if not COMPONENTS_DIR_PATH.exists():
        logger.info(f"Creating components directory at '{COMPONENTS_DIR_PATH}'")
        COMPONENTS_DIR_PATH.mkdir(parents=True)

    if not INDEX_FILE_PATH.exists():
        logger.info(f"Creating index file at '{INDEX_FILE_PATH}'")
        INDEX_FILE_PATH.write_text(
            BIOME_DISABLE_IMPORT_SORT,
            encoding="utf-8",
        )


@cli.command(help="Generate components")
@click.argument("component_name", type=str)
@click.option(
    "--type",
    "-t",
    type=click.Choice(ComponentType),
    default=ComponentType.base,
    help="SolidJS Component Type",
)
@click.option(
    "--dry-run",
    type=bool,
    is_flag=True,
    help="Print generated code without writing to filesystem",
)
def gen(component_name: str, type: ComponentType, dry_run: bool):
    component_name = toPascalCase(component_name)

    tsx = Tsx(component_name, type).build()

    if dry_run:
        print(tsx)
        sys.exit(0)

    if not COMPONENTS_DIR_PATH.exists():
        logger.error(f"Components directory not found at '{COMPONENTS_DIR_PATH}'")
        sys.exit(1)

    component_path = COMPONENTS_DIR_PATH / component_name

    if component_path.exists():
        logger.error(f"Component already exists '{component_path}'")
        sys.exit(1)

    if component_path.exists():
        logger.error(f"Component already exists '{component_path}'")
        sys.exit(1)

    component_path.mkdir(parents=True)

    css_file = component_path / f"{component_name}.module.css"
    css_file.touch()

    tsx_file = component_path / f"{component_name}.tsx"
    tsx_file.write_text(tsx, encoding="utf-8")

    local_index_file = component_path / "index.ts"
    local_index_file.touch()

    with open(local_index_file, "a", encoding="utf-8") as f:
        f.write(BIOME_DISABLE_IMPORT_SORT)
        f.write(f"export * from './{component_name}';\n")

    with open(INDEX_FILE_PATH, "a", encoding="utf-8") as f:
        f.write(f"export * from './{component_name}';\n")

    logger.info(f"Component created '{component_path}'")
    logger.info(f"Component added to index file '{INDEX_FILE_PATH}'")


if __name__ == "__main__":
    cli()
