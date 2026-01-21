use serde::Serialize;
use ts_rs::TS;

#[derive(TS, Serialize, thiserror::Error, Debug)]
#[ts(export)]
#[serde(tag = "kind", content = "message")]
pub enum CommandError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Visual Novel not found in library")]
    NotFound,

    #[error("Filesystem error: {0}")]
    Io(String),

    #[error("Failed to launch game: {0}")]
    LaunchFailure(String),

    #[error("Game is already running")]
    AlreadyRunning,

    #[error("An unexpected error occurred: {0}")]
    Unknown(String),
}

impl From<diesel::result::Error> for CommandError {
    fn from(error: diesel::result::Error) -> Self {
        match error {
            diesel::result::Error::NotFound => CommandError::NotFound,
            _ => CommandError::Database(error.to_string()),
        }
    }
}

impl From<std::io::Error> for CommandError {
    fn from(error: std::io::Error) -> Self {
        CommandError::Io(error.to_string())
    }
}

impl From<anyhow::Error> for CommandError {
    fn from(error: anyhow::Error) -> Self {
        CommandError::Unknown(format!("{:#}", error))
    }
}

pub type CommandResult<T> = Result<T, CommandError>;
