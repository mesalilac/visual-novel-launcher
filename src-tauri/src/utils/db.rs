pub fn normalize_optional_string(s: Option<String>) -> Option<String> {
    s.map(|s| s.trim().to_string())
}
