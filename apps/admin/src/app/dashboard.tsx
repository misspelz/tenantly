"use client";

import {
  AuthUserSchema,
  CreatePropertySchema,
  PropertySchema,
  PropertiesListResponseSchema,
  type AuthUser,
  type Property,
} from "@tenantly/contracts";
import { useRouter } from "next/navigation";
import { useEffect, useState, type SyntheticEvent } from "react";

import { apiBaseUrl } from "../lib/api";

export function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const sessionResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          credentials: "include",
        });

        if (sessionResponse.status === 401) {
          router.replace("/login");
          return;
        }

        if (!sessionResponse.ok) {
          throw new Error("Could not load your account.");
        }

        const session = AuthUserSchema.safeParse(await sessionResponse.json());

        if (!session.success) {
          throw new Error("The API returned an invalid account response.");
        }

        const propertiesResponse = await fetch(`${apiBaseUrl}/properties`, {
          credentials: "include",
        });

        if (!propertiesResponse.ok) {
          throw new Error("Could not load properties.");
        }

        const propertyList = PropertiesListResponseSchema.safeParse(
          await propertiesResponse.json(),
        );

        if (!propertyList.success) {
          throw new Error("The API returned an invalid properties response.");
        }

        if (active) {
          setUser(session.data);
          setProperties(propertyList.data.data);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Could not load the dashboard.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleCreateProperty(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const input = CreatePropertySchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
    });

    if (!input.success) {
      setError("Enter a property name and address.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${apiBaseUrl}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input.data),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not create the property.");
      }

      const created: unknown = await response.json();
      const newProperty = PropertySchema.safeParse(created);

      if (!newProperty.success) {
        throw new Error("The API returned an invalid property response.");
      }

      setProperties((current) => [newProperty.data, ...current]);
      form.reset();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create the property.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not sign out. Please try again.");
      }

      router.replace("/login");
      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Could not sign out.");
    }
  }

  if (isLoading) {
    return <main aria-busy="true">Loading your dashboard...</main>;
  }

  if (!user) {
    return <main>{error ? <p role="alert">{error}</p> : null}</main>;
  }

  const canManageProperties = user.role === "owner" || user.role === "property_manager";

  return (
    <main>
      <header>
        <h1>Tenantly Admin</h1>
        <p>
          Signed in as {user.email} ({user.role.replaceAll("_", " ")}).
        </p>
        <button
          onClick={() => {
            void handleSignOut();
          }}
          type="button"
        >
          Sign out
        </button>
      </header>

      <section>
        <h2>Properties</h2>
        {error ? <p role="alert">{error}</p> : null}
        {properties.length > 0 ? (
          <ul>
            {properties.map((property) => (
              <li key={property.id}>
                <strong>{property.name}</strong> — {property.address}
              </li>
            ))}
          </ul>
        ) : (
          <p>No properties yet.</p>
        )}
      </section>

      {canManageProperties ? (
        <section>
          <h2>Add a property</h2>
          <form
            onSubmit={(event) => {
              void handleCreateProperty(event);
            }}
          >
            <div>
              <label htmlFor="property-name">Name</label>
              <input id="property-name" name="name" required />
            </div>
            <div>
              <label htmlFor="property-address">Address</label>
              <input id="property-address" name="address" required />
            </div>
            <button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Add property"}
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
