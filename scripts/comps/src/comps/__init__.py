from io import StringIO
import sys
import click

from pathlib import Path
from .logger import logger
from enum import Enum, auto


COMPONENTS_DIR_PATH = Path("src/components")
INDEX_FILE_PATH = COMPONENTS_DIR_PATH / "index.ts"

BASE_INDENT_BY = 4


def get_indent(level: int) -> str:
    return " " * BASE_INDENT_BY * level


# TODO: add rest of types
class ComponentType(Enum):
    base = auto()  # Default generic type
    parent = auto()  # allows an optional children prop with the usual type in JSX
    void = auto()  # Component without children


def toPascalCase(s: str) -> str:
    s = s.strip().lower().replace("-", " ").replace("_", " ")

    return "".join(word.capitalize() for word in s.split())


def build_tsx(comp_name: str, type: ComponentType) -> str:
    component_type_import_name = "Component"

    if type == ComponentType.void:
        component_type_import_name = "VoidComponent"
    if type == ComponentType.parent:
        component_type_import_name = "ParentComponent"

    buffer = StringIO()

    buffer.write("import type {\n")
    buffer.write(get_indent(1))
    buffer.write(f"{component_type_import_name},\n")
    buffer.write("} from 'solid-js';\n")
    buffer.write("\n")

    buffer.write(f"import './{comp_name}.css';\n")
    buffer.write("\n")

    buffer.write("type Props = {\n")
    buffer.write(get_indent(1))
    buffer.write("ref?: HTMLDivElement | ((el: HTMLDivElement) => void);\n")
    buffer.write("}\n")

    buffer.write("\n")
    buffer.write(
        f"export const {comp_name}: {component_type_import_name}<Props> = (props: Props) => {{\n"
    )
    buffer.write(get_indent(1))
    buffer.write(f"return <div>{comp_name} component</div>;\n")
    buffer.write("};\n")

    content = buffer.getvalue()
    buffer.close()
    return content


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
            "/** biome-ignore-all assist/source/organizeImports: false */\n\n",
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
def gen(component_name: str, type: ComponentType):
    if not COMPONENTS_DIR_PATH.exists():
        logger.error(f"Components directory not found at '{COMPONENTS_DIR_PATH}'")
        sys.exit(1)

    component_name = toPascalCase(component_name)

    tsx = build_tsx(component_name, type)

    print(tsx)

    sys.exit(0)

    component_path = COMPONENTS_DIR_PATH / component_name

    if component_path.exists():
        logger.error(f"Component already exists '{component_path}'")
        sys.exit(1)

    if component_path.exists():
        logger.error(f"Component already exists '{component_path}'")
        sys.exit(1)

    component_path.mkdir(parents=True)

    css_file = component_path / f"{component_name}.css"
    css_file.touch()

    tsx_file = component_path / f"{component_name}.tsx"
    tsx_file.write_text(tsx, encoding="utf-8")

    with open(INDEX_FILE_PATH, "a", encoding="utf-8") as f:
        f.write(f"export * from './{component_name}/{component_name}';\n")

    logger.info(f"Component created '{component_path}'")
    logger.info(f"Component added to index file '{INDEX_FILE_PATH}'")


if __name__ == "__main__":
    cli()
