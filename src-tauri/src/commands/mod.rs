use serde::Serialize;

#[derive(specta::Type, Serialize, thiserror::Error, Debug)]
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

pub mod prelude {
    pub use crate::bridge::{dto::*, requests::*};
    pub use crate::commands::{CommandError, CommandResult};
    use crate::database::connection::DbPoolWrapper;
    pub use crate::database::entities::*;
    pub use diesel::prelude::*;
    pub use serde::{Deserialize, Serialize};
    use tauri::State;
    pub use tauri_helper::auto_collect_command;

    pub mod schema {
        pub use crate::schema::*;
    }

    pub type DbState<'a> = State<'a, DbPoolWrapper>;
}

mod create;
mod get;
mod remove;
mod update;
mod util;

pub use create::*;
pub use get::*;
pub use remove::*;
pub use update::*;
pub use util::*;
