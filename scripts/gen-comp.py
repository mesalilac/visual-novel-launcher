#!/usr/bin/env python

import argparse
from io import StringIO
from pathlib import Path
import os
import sys

COMPONENTS_DIR_PATH = Path("src/components")
INDEX_FILE = COMPONENTS_DIR_PATH / "index.ts"


def toPascalCase(s: str) -> str:
    s = s.strip().lower().replace("-", " ").replace("_", " ")

    return "".join(word.capitalize() for word in s.split())


def build_tsx(comp_name: str) -> str:
    indent = " " * 4

    buffer = StringIO()

    buffer.write(f"import './{comp_name}.css';\n")
    buffer.write("\n")
    buffer.write(f"export const {comp_name} = () => {{\n")
    buffer.write(indent)
    buffer.write(f"return <>{comp_name} component</>;\n")
    buffer.write("};\n")

    content = buffer.getvalue()
    buffer.close()
    return content


def main():

    if not COMPONENTS_DIR_PATH.exists():
        print(f"[ERROR]: Components directory not found at '{COMPONENTS_DIR_PATH}'")
        sys.exit(1)

    parser = argparse.ArgumentParser()
    parser.add_argument("component_name", type=str, help="Component name")
    parser.add_argument(
        "--dry-run",
        "-d",
        action="store_true",
        help="Do a dry run and don't write to filesystem",
    )
    args = parser.parse_args()
    component_name: str = toPascalCase(args.component_name)
    dry_run: bool = args.dry_run

    tsx = build_tsx(component_name)

    if dry_run:
        print(tsx)
        return

    component_path = COMPONENTS_DIR_PATH / component_name

    if component_path.exists():
        print(f"[ERROR]: Component already exists '{component_path}'")
        return

    os.makedirs(component_path)

    css_file = component_path / f"{component_name}.css"
    css_file.write_text("")

    tsx_file = component_path / f"{component_name}.tsx"
    tsx_file.write_text(tsx)

    with open(INDEX_FILE, "a", encoding="utf-8") as f:
        f.write(f"export * from './{component_name}/{component_name}';\n")

    print(f"[INFO]: Component created '{component_path}'")


if __name__ == "__main__":
    main()
