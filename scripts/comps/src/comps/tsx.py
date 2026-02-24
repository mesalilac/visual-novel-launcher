import subprocess
from comps.types import ComponentType
from io import StringIO

BASE_INDENT_BY = 4


def get_indent(level: int) -> str:
    return " " * BASE_INDENT_BY * level


class Tsx:
    def __init__(self, name: str, type: ComponentType) -> None:
        self.b = StringIO()
        self.name = name
        self.type = type

    def write(self, line: str, indent_level: int = 0) -> None:
        self.b.write(get_indent(indent_level))
        self.b.write(line)

    def write_line(self, line: str, indent_level: int = 0) -> None:
        self.b.write(get_indent(indent_level))
        self.b.write(line)
        self.b.write("\n")

    def empty_line(self) -> None:
        self.b.write("\n")

    def get_type(self) -> str:
        match self.type:
            case ComponentType.void:
                return "VoidComponent"
            case ComponentType.parent:
                return "ParentComponent"
            case ComponentType.base:
                return "Component"
            case _:
                return "Component"

    def format(self) -> str:
        text = self.b.getvalue()

        p = subprocess.run(
            ["pnpm", "biome", "format", "--stdin-file-path", "filename.tsx"],
            text=True,
            input=text,
            capture_output=True,
            shell=True,
        )

        if p.returncode == 0:
            return p.stdout
        else:
            return text

    def build(self) -> str:
        comp_type = self.get_type()

        self.write_line("import type {")
        self.write_line(f"{comp_type},", 1)
        self.write_line("} from 'solid-js';")
        self.empty_line()

        self.write_line(f"import './{self.name}.css';")
        self.empty_line()

        self.write_line("type Props = {")
        self.write_line("ref?: HTMLDivElement | ((el: HTMLDivElement) => void);", 1)
        self.write_line("}")
        self.empty_line()

        self.write_line(
            f"export const {self.name}: {comp_type}<Props> = (props: Props) => {{"
        )

        self.write_line(f"return <div ref={{props.ref}}>{self.name} component</div>;")

        self.write_line("};")

        formatted = self.format()

        self.b.close()
        return formatted
