// shared structs between backend and frontend

pub mod dto;
pub mod requests;

pub type CommandResult<T> = Result<T, String>;
