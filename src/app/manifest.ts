import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StoxMate",
    short_name: "StoxMate",
    description:
      "Australia's AI investment analyst. Market intelligence, research and portfolio insights in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C1222",
    theme_color: "#0C1222",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/smicon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}