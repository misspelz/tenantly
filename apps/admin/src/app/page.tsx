import { PropertySchema } from "@tenantly/contracts";

const exampleProperty = PropertySchema.parse({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Example property",
});

export default function HomePage() {
  return (
    <main>
      <h1>Tenantly Admin</h1>
      <p>Manage your properties, tenants and rent.</p>
      <p>Contract example: {exampleProperty.name}</p>
    </main>
  );
}
