from enum import Enum, auto


class ComponentType(Enum):
    base = auto()  # Default generic type
    parent = auto()  # allows an optional children prop with the usual type in JSX
    void = auto()  # Component without children
