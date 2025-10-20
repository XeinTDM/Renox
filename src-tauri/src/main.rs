// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rand::Rng;
use reqwest;
use serde::Deserialize;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_opener::OpenerExt;

use sha2::{Digest, Sha256};
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;

fn read_env_var(key: &str) -> Result<String, String> {
    std::env::var(key).map_err(|_| format!("Missing required environment variable: {}", key))
}

fn github_redirect_uri() -> String {
    std::env::var("GITHUB_REDIRECT_URI").unwrap_or_else(|_| "renox://auth/github/callback".to_string())
}

struct OauthState(Mutex<Option<(String, String)>>); // (state, code_verifier)

#[derive(Deserialize)]
struct OAuthTokenResponse {
    access_token: String,
}

#[derive(Deserialize)]
struct GitHubUser {
    login: String,
}

#[tauri::command]
fn get_app_version(app_handle: AppHandle) -> String {
    app_handle.package_info().version.to_string()
}

#[tauri::command]
async fn set_autostart(app_handle: AppHandle, enable: bool) -> Result<(), String> {
    let autostart = app_handle.autolaunch();
    if enable {
        autostart.enable().map_err(|e| e.to_string())
    } else {
        autostart.disable().map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn get_autostart_enabled(app_handle: AppHandle) -> Result<bool, String> {
    let autostart = app_handle.autolaunch();
    autostart.is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_minimize_to_tray(app_handle: AppHandle, enable: bool) -> Result<(), String> {
    let window = app_handle
        .get_webview_window("main")
        .ok_or("Main window not found")?;
    if enable {
        window.hide().map_err(|e| e.to_string())?;
    } else {
        window.show().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn base64url_encode(input: &[u8]) -> String {
    URL_SAFE_NO_PAD.encode(input)
}

#[tauri::command]
async fn github_oauth_start(
    app_handle: AppHandle,
    oauth_state: State<'_, OauthState>,
) -> Result<(), String> {
    let state_string: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    // PKCE code_verifier
    let code_verifier: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(64)
        .map(char::from)
        .collect();

    // code_challenge = BASE64URL-ENCODE(SHA256(code_verifier))
    let mut hasher = Sha256::new();
    hasher.update(code_verifier.as_bytes());
    let code_challenge = base64url_encode(&hasher.finalize());

    *oauth_state.0.lock().unwrap() = Some((state_string.clone(), code_verifier.clone()));

    let client_id = read_env_var("GITHUB_CLIENT_ID")?;
    let redirect_uri = github_redirect_uri();
    let scope = "read:user"; // limit scopes for privacy

    let auth_url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope={}&state={}&code_challenge_method=S256&code_challenge={}",
        client_id, redirect_uri, scope, state_string, code_challenge
    );

    if !auth_url.starts_with("https://github.com/login/oauth/authorize") {
        return Err("Invalid authorization URL".to_string());
    }
    app_handle
        .opener()
        .open_url(auth_url, None::<String>)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn github_oauth_callback(
    code: String,
    state: String,
    oauth_state: State<'_, OauthState>,
) -> Result<String, String> {
    let stored = oauth_state.0.lock().unwrap().take();

    match stored {
        Some((expected_state, code_verifier)) if expected_state == state => {
            let client_id = read_env_var("GITHUB_CLIENT_ID")?;
            let client_secret = read_env_var("GITHUB_CLIENT_SECRET")?;
            let redirect_uri = github_redirect_uri();

            // Include PKCE code_verifier with token request
            let params = [
                ("client_id", client_id.as_str()),
                ("client_secret", client_secret.as_str()),
                ("code", &code),
                ("redirect_uri", redirect_uri.as_str()),
                ("grant_type", "authorization_code"),
                ("code_verifier", code_verifier.as_str()),
            ];

            let client = reqwest::Client::builder()
                .user_agent("Renox-Loader")
                .build()
                .map_err(|e| e.to_string())?;

            let res = client
                .post("https://github.com/login/oauth/access_token")
                .form(&params)
                .header("Accept", "application/json")
                .send()
                .await
                .map_err(|e| {
                    println!("Error sending token request: {:?}", e);
                    e.to_string()
                })?;

            if !res.status().is_success() {
                let error_body = res
                    .text()
                    .await
                    .unwrap_or_else(|_| "Could not read error body".to_string());
                println!("GitHub token API responded with an error: {}", error_body);
                return Err(format!("GitHub token API error: {}", error_body));
            }

            let token_response: OAuthTokenResponse = res.json().await.map_err(|e| {
                println!("Error parsing token response: {:?}", e);
                e.to_string()
            })?;

            // Use token to fetch user, do not persist token
            let user_res = client
                .get("https://api.github.com/user")
                .header("Authorization", format!("Bearer {}", token_response.access_token))
                .send()
                .await
                .map_err(|e| {
                    println!("Error fetching user: {:?}", e);
                    e.to_string()
                })?;

            if !user_res.status().is_success() {
                let error_body = user_res
                    .text()
                    .await
                    .unwrap_or_else(|_| "Could not read error body".to_string());
                println!("GitHub user API responded with an error: {}", error_body);
                return Err(format!("GitHub user API error: {}", error_body));
            }

            let github_user: GitHubUser = user_res.json().await.map_err(|e| {
                println!("Error parsing user response: {:?}", e);
                e.to_string()
            })?;

            // Discard access token here by dropping token_response
            drop(token_response);

            let user_info = serde_json::json!({
                "username": github_user.login,
                "email": serde_json::Value::Null,
            });

            Ok(user_info.to_string())
        }
        _ => Err("Invalid OAuth state. CSRF attack suspected.".to_string()),
    }
}

fn main() {
    let _ = dotenvy::dotenv();

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            println!("{}, {argv:?}, {}", app.package_info().name, _cwd);
            app.emit("single-instance-activated", argv).unwrap();
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_deep_link::init())
        .manage(OauthState(Mutex::new(None)))
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();
            let random_string: String = rand::thread_rng()
                .sample_iter(&rand::distributions::Alphanumeric)
                .take(10)
                .map(char::from)
                .collect();
            main_window.set_title(&random_string).unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_autostart,
            get_autostart_enabled,
            set_minimize_to_tray,
            get_app_version,
            github_oauth_start,
            github_oauth_callback
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}