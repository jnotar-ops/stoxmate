import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StoxMate",
    short_name: "StoxMate",
    description:
      "AI-powered market intelligence, research and portfolio insights for Australian investors.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0C1222",
    theme_color: "#0C1222",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/android/launchericon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android/launchericon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}