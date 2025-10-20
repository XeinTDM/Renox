// use tauri_plugin_autostart::MacosLauncher;
// use auto_launch::AutoLaunch;
// use std::env;

// #[tauri::command]
// async fn set_autostart(app_handle: AppHandle, enable: bool) -> Result<(), String> {
//     let app_name = app_handle.package_info().name.clone();
//     let app_path = std::env::current_exe().unwrap().to_str().unwrap().to_string();
//     let autolaunch = AutoLaunch::new(&app_name, &app_path, &[] as &[&str]);
//     if enable {
//         autolaunch.enable().map_err(|e| e.to_string())
//     } else {
//         autolaunch.disable().map_err(|e| e.to_string())
//     }
// }

// #[tauri::command]
// async fn set_minimize_to_tray(app_handle: AppHandle, enable: bool) -> Result<(), String> {
//     let window = app_handle.get_webview_window("main").ok_or("Main window not found")?;
//     if enable {
//         window.hide().map_err(|e| e.to_string())?;
//     } else {
//         window.show().map_err(|e| e.to_string())?;
//     }
//     Ok(())
// }
