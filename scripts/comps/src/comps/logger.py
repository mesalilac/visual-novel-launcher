from click import echo, style


class Logger:
    def __init__(self):
        self.width = 9

    def _format_log(self, level, msg, color):
        padded_level = level.center(self.width)

        prefix = "[" + style(padded_level, color) + "]"
        message = style(msg, "cyan")

        return prefix + " " + message

    def info(self, msg):
        echo(self._format_log("INFO", msg, "green"))

    def debug(self, msg):
        echo(self._format_log("DEBUG", msg, "blue"))

    def error(self, msg):
        echo(self._format_log("ERROR", msg, "red"), err=True)

    def warning(self, msg):
        echo(self._format_log("WARNING", msg, "yellow"))


logger = Logger()
