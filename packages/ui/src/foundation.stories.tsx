import type { Meta, StoryObj } from "@storybook/react-vite";

function ThemePreview() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <section className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Tenantly UI</p>
        <h1 className="mt-2 text-2xl font-semibold">Shared styles are working</h1>
        <p className="mt-2 text-muted-foreground">
          Use the Theme menu above to preview light and dark tokens.
        </p>
        <button className="mt-5 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Example button
        </button>
      </section>
    </main>
  );
}

const meta = {
  title: "Foundation/Theme preview",
  component: ThemePreview,
} satisfies Meta<typeof ThemePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {};
