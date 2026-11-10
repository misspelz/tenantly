import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Switch between light and dark mode",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.mode = context.globals.theme === "dark" ? "dark" : "light";
      return Story();
    },
  ],
};

export default preview;
