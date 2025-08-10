export {}

const link = document.querySelector("link[rel=manifest]") as HTMLLinkElement | null;
if (link) link.href = `data:application/manifest+json,${encodeURIComponent(
  JSON.stringify({
    name: "Asteroids Game",
    short_name: "Asteroids",
    start_url: location.href,
    background_color: "#000000",
    theme_color: "#000000",
    display: "fullscreen",
  }),
)}`;
