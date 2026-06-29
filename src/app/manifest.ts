import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeBase",
    short_name: "HomeBase",
    description: "Organisez votre appartement — inventaire & ménage",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#4F46E5",
    theme_color: "#4F46E5",
    categories: ["lifestyle", "productivity"],
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Inventaire",
        short_name: "Inventaire",
        description: "Retrouver un objet",
        url: "/inventaire",
      },
      {
        name: "Ménage",
        short_name: "Ménage",
        description: "Tâches ménagères",
        url: "/menage",
      },
    ],
  }
}
