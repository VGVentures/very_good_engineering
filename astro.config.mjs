import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://engineering.verygood.ventures",
  integrations: [
    starlight({
      favicon: "./public/favicon.png",
      title: "VGV Engineering",
      head: [
        {
          // Fix theme flickering on page load.
          // See https://scottwillsey.com/theme-flicker/
          tag: "script",
          attrs: {
            type: "text/javascript",
          },
          content: `
              theme = localStorage.getItem("theme") || "light";
              document.documentElement.dataset.theme = theme;
            `,
        },
      ],
      customCss: [
        // Add tailwind base styles:
        "./src/styles/tailwind.css",
        "./src/styles/vgv_brand.css",
        "./src/styles/theme.css",
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
          "https://github.com/vgventures/very_good_engineering/edit/main/",
      },
      logo: {
        light: "./src/assets/logos/logo_light.svg",
        dark: "./src/assets/logos/logo_dark.svg",
      },
      social: {
        github: "https://github.com/vgventures/very_good_engineering",
      },
      sidebar: [
        {
          label: "🦄 Very Good Engineering",
          autogenerate: {
            directory: "engineering",
          },
        },
        {
          label: "🏛️ Architecture",
          autogenerate: {
            directory: "architecture",
          },
        },
        {
          label: "🦾 Automation",
          autogenerate: {
            directory: "automation",
          },
        },
        {
          label: "✨ Code Style",
          autogenerate: {
            directory: "code_style",
          },
        },
        {
          label: "❌ Error Handling",
          autogenerate: {
            directory: "error_handling",
          },
        },
        {
          label: "📺 Examples",
          badge: "NEW",
          autogenerate: {
            directory: "examples",
          },
        },
        {
          label: "🌐 Internationalization",
          autogenerate: {
            directory: "internationalization",
          },
        },
        {
          label: "🗺️ Navigation",
          autogenerate: {
            directory: "navigation",
          },
        },
        {
          label: "🪄 State Management",
          autogenerate: {
            directory: "state_management",
          },
        },
        {
          label: "🧪 Testing",
          autogenerate: {
            directory: "testing",
          },
        },
        {
          label: "🎨 Theming",
          autogenerate: {
            directory: "theming",
          },
        },
        {
          label: "🧩 Widgets",
          autogenerate: {
            directory: "widgets",
          },
        },
      ],
      components: {
        TwoColumnContent:
          "./src/components/vgv_two_column_content/vgv-two-column-content.astro",
        Header: "./src/components/vgv_nav/vgv-nav.astro",
        PageFrame: "./src/components/vgv_page/vgv-page-frame.astro",
      },
    }),
    react(),
    mdx(),
    tailwind({
      // Disable the default base styles:
      applyBaseStyles: false,
    }),
  ],
});
