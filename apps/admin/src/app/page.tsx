import { CreatePropertySchema } from "@tenantly/contracts";

const exampleProperty = CreatePropertySchema.parse({
  name: "Example property",
  address: "1 Example Street, Lagos",
});

export default function HomePage() {
  return (
    <main>
      <h1>Tenantly Admin</h1>
      <p>Manage your properties, tenants and rent.</p>
      <p>Contract example: {exampleProperty.name}</p>
      <p>Address: {exampleProperty.address}</p>
    </main>
  );
}
