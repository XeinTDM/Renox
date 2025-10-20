# Renox, a game cheat loader

Renox is a modern, cross-platform desktop application designed to facilitate the loading and management of game cheats. Built with Tauri, Svelte, and Rust, it provides a sleek user interface and robust backend for a seamless experience.

## Features

*   **Cross-Platform:** Available on Windows, macOS, and Linux.
*   **Modern UI:** Powered by Svelte for a responsive and intuitive user experience.
*   **Secure & Performant:** Leverages Rust and Tauri for native performance and enhanced security.
*   **Offline‑First & Private:** All features operate locally whenever possible. The only intentional online action is authentication via GitHub OAuth (minimal scopes, HTTPS). No telemetry or other external calls.
*   **Cheat Management:** Track the status of various game cheats (e.g., Undetected, Detected, Maintenance, Updating, Expired) and manage your licenses.
*   **Role-Based Permissions:** Comprehensive permission system for cheat developers, resellers, and administrators.
*   **Admin Dashboard:** Full management interface for cheat distribution and user management.

## Installation

To get Renox up and running on your local machine, follow these steps:

### Prerequisites

*   Node.js (v20 or higher recommended)
*   Rust (latest stable version)
*   pnpm (for package management)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/XeinTDM/renox.git
    cd renox
    ```
2.  **Install frontend dependencies:**
    ```bash
    pnpm install
    ```
3.  **Create an `.env` file (or set environment variables):**
    ```bash
    # required
    GITHUB_CLIENT_ID=your_client_id
    GITHUB_CLIENT_SECRET=your_client_secret
    # optional (defaults to renox://auth/github/callback)
    GITHUB_REDIRECT_URI=renox://auth/github/callback
    ```
4.  **Build the application:**
    ```bash
    pnpm tauri build
    ```

This will build the application for your respective operating system. The executable will be located in `src-tauri/target/release/bundle/`.

## Usage

After building the application, you can find the executable in `src-tauri/target/release/bundle/`. Launch this executable to start Renox.

Once launched, you can use the intuitive interface to manage and load your game cheats.

### User Roles

The application supports different user roles with varying levels of access:

- **User**: Basic access to view and launch cheats
- **Reseller**: Can manage cheats, licenses, and view user data
- **Developer**: Full cheat management capabilities
- **Admin**: Complete system administration access

For detailed information about the permissions system, see [PERMISSIONS.md](./PERMISSIONS.md).

## Development

To run Renox in development mode:

```bash
pnpm tauri dev
```

This will open the Renox application in a development window, complete with hot-reloading for frontend changes.

During development, environment variables are loaded from a local `.env` file.

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License.