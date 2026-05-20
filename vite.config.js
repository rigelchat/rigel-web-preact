import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import preact from "@preact/preset-vite";
import path from "path";
import { readFileSync } from "fs";
import { execSync } from "child_process";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
let commitHash = execSync("git rev-parse --short HEAD").toString().trim();

if (execSync("git status --porcelain").toString().trim().length > 0) {
    commitHash += `-dirty-${new Date().toISOString()}`;
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        preact(),
        VitePWA({
            injectRegister: "inline",
            registerType: "prompt",
            manifest: {
                lang: "fr",
                display: "standalone",
                launch_handler: {
                    client_mode: "focus-existing"
                },
                name: "Rigel",
                short_name: "Rigel",
                description: "L'endroit idéal pour échanger et discuter avec vos communautés.",
                theme_color: "#313338",
                background_color: "#313338",
                categories: [
                    "entertainment",
                    "games",
                    "productivity",
                    "social"
                ],
                icons: [
                    {
                        src: "/assets/logos/logo-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any"
                    },
                    {
                        src: "/assets/logos/logo-512x512-square-maskable.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable"
                    }
                ],
                screenshots: [
                    {
                        src: "/assets/screenshots/mobile-messages.png",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "Chat with friends and communities"
                    },
                    {
                        src: "/assets/screenshots/mobile-channels.png",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "Navigate channels and conversations"
                    },
                    {
                        src: "/assets/screenshots/mobile-discovery.png",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "Explore servers on the go"
                    },
                    {
                        src: "/assets/screenshots/desktop-chat.png",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Chat with your friends and communities"
                    },
                    {
                        src: "/assets/screenshots/desktop-discovery.png",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Browse and join public servers"
                    }
                ]
            },
            workbox: {
                cleanupOutdatedCaches: true,
                globPatterns: ["**/*.{html,css,js,ico,png,webp,svg,webm,mp3,wasm,woff2}"],
                globIgnores: ["**/assets/logos/**", "**/assets/screenshots/**"],
                navigateFallback: "/index.html"
            }
        })
    ],
    define: {
        __APP_ENV__: JSON.stringify(capitalize(mode)),
        __APP_VERSION__: JSON.stringify(pkg.version),
        __COMMIT_HASH__: JSON.stringify(commitHash)
    },
    server: {
        host: true
    },
    resolve: {
        alias: {
            "rigel.js": path.resolve(__dirname, "rigel.js")
        }
    },
    esbuild: {
        drop: mode === "production" ? ["console", "debugger"] : []
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("emojibase-data")) {
                            return "vendor-emojibase-data";
                        };
                        return "vendor"
                    };
                }
            }
        }
    }
}));