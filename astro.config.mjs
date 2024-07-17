import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://VGVentures.github.io",
  integrations: [
    starlight({
      favicon: "./public/favicon.png",
      title: "Very Good Practices",
      head: [
        {
          // Fix theme flickering on page load.
          // See https://scottwillsey.com/theme-flicker/
          tag: "script",
          attrs: {
            src: `
            <script>
              const theme = localStorage.getItem("theme") || "light";
              document.documentElement.dataset.theme = theme;
            </script>
            `,
          },
        },
      ],
      customCss: [
        // Add tailwind base styles:
        "./src/assets/styles/tailwind.css",
        "@fontsource/poppins/100.css",
        "@fontsource/poppins/200.css",
        "@fontsource/poppins/300.css",
        "@fontsource/poppins/400.css",
        "@fontsource/poppins/500.css",
        "@fontsource/poppins/600.css",
        "@fontsource/poppins/700.css",
        "@fontsource/poppins/800.css",
        "@fontsource/poppins/900.css",
      ],
      editLink: {
        baseUrl:
          "https://github.com/verygoodopensource/very_good_practices/edit/main/docs/",
      },
      logo: {
        light: "./src/assets/logos/unicorn_light.png",
        dark: "./src/assets/logos/unicorn_dark.png",
      },
      social: {
        github: "https://github.com/verygoodopensource/very_good_practices",
      },
      sidebar: [
        {
          label: "Architecture",
          autogenerate: {
            directory: "architecture",
          },
        },
        {
          label: "Automation",
          autogenerate: {
            directory: "automation",
          },
        },
        {
          label: "Development",
          autogenerate: {
            directory: "development",
          },
        },
        {
          label: "State Management",
          autogenerate: {
            directory: "state_management",
          },
        },
        {
          label: "Testing",
          autogenerate: {
            directory: "testing",
          },
        },
        {
          label: "Theming",
          autogenerate: {
            directory: "theming",
          },
        },
      ],
    }),
    react(),
    mdx(),
    tailwind({
      // Disable the default base styles:
      applyBaseStyles: false,
    }),
  ],
});
