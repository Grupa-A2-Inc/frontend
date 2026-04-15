"use client";

import { useState } from "react";
import { OrganizationProfile } from "@/lib/admin-dashboard/types";
// Tipul de date pentru profilul organizatiei

import { UpdateOrganizationPayload } from "@/lib/admin-dashboard/types";

import {
  getOrganizationIdFromStorage,
  updateOrganizationById,
} from "@/lib/admin-dashboard/api";
// Functii care citesc ID-ul organizatiei si trimit update-uir catre backend

import AdminStatusBanner from "./AdminStatusBanner";
// Componenta reutilizabila pentru afisarea mesajelor de eroare/succes

// Tipurile primite ca props
type Props = {
  initialValues: OrganizationProfile;
  onCancel: () => void;
  onSuccess: (updatedOrganization: OrganizationProfile) => void;
};

export default function OrganizationInlineEditForm({
  initialValues,
  onCancel,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<OrganizationProfile>(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Functie generica pentru actualizarea campurilor din formular
  function setField<K extends keyof OrganizationProfile>(
    field: K,
    value: OrganizationProfile[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Validare simpla a campurilor obligatorii
  function validate() {
    if (!form.organizationName.trim()) {
      return "Organization name is required.";
    }

    if (!form.organizationType.trim()) {
      return "Organization type is required.";
    }

    if (!form.country.trim()) {
      return "Country is required.";
    }

    if (!form.city.trim()) {
      return "City is required.";
    }

    return "";
  }

  // Handler pentru submit-ul formularului
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Resetam mesajele
    setErrorMessage("");
    setSuccessMessage("");

    // Validare
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // Obtinem ID-ul organizatiei
    const organizationId = getOrganizationIdFromStorage();
    if (!organizationId) {
      setErrorMessage("Organization ID was not found in the current session.");
      return;
    }

    setIsSaving(true);

    try {
      // Trimitem update-ul catre backend
      const payload: UpdateOrganizationPayload = {
        name: form.organizationName,
        organizationType: form.organizationType,
        country: form.country,
        city: form.city,
        address: form.address,
        phoneNumber: form.phoneNumber,

      };

      await updateOrganizationById(organizationId, payload);

      // Afisam mesaj de succes
      setSuccessMessage("Organization details were updated successfully.");

      // Asteptam putin si notificam componenta parinte
      setTimeout(() => {
        onSuccess(form);
      }, 500);
    } catch (error) {
      // Gestionam erorile 
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update organization."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Banner pentru erori */}
      {errorMessage ? (
        <AdminStatusBanner variant="error" message={errorMessage} />
      ) : null}

      {/* Banner pentru succes */}
      {successMessage ? (
        <AdminStatusBanner variant="success" message={successMessage} />
      ) : null}

      {/* Grid cu campurile formularului */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Organization Name"
          value={form.organizationName}
          onChange={(value) => setField("organizationName", value)}
          required
        />
        <Field
          label="Organization Type"
          value={form.organizationType}
          onChange={(value) => setField("organizationType", value)}
          required
        />
        <Field
          label="Country"
          value={form.country}
          onChange={(value) => setField("country", value)}
          required
        />
        <Field
          label="City"
          value={form.city}
          onChange={(value) => setField("city", value)}
          required
        />
        <Field
          label="Address"
          value={form.address}
          onChange={(value) => setField("address", value)}
        />
        <Field
          label="Phone Number"
          value={form.phoneNumber}
          onChange={(value) => setField("phoneNumber", value)}
        />
      </div>

      {/* Butoane de actiune */}
      <div className="flex flex-wrap gap-3 pt-2">

        {/* Butonul de salvare */}
        <button
          type="submit"
          disabled={isSaving}
          className="
            rounded-lg 
            bg-[rgb(var(--button-primary-bg))] 
            px-4 py-2 text-sm font-medium 
            text-[rgb(var(--button-primary-text))] 
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        { /* Butonul de anulare */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="
            rounded-lg 
            border-[rgb(var(--border))] 
            px-4 py-2 text-sm font-medium 
            hover:bg-[rgb(var(--bg-card))]/80 
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Componenta mica si reutilizabila pentru campurile formularului
type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

function Field({ label, value, onChange, required }: FieldProps) {
  return (
    <label className="space-y-2">

      {/* Label-ul campului */}
      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
        {label}
        {required ? " *" : ""}
      </span>

      {/* Input-ul propriu-zis */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-lg 
          border-[rgb(var(--border))]
          bg-[rgb(var(--bg-card))] 
          text-[rgb(var(--text-secondary))]
          px-3 py-2.5 text-sm outline-none transition 
          focus:border-[rgb(var(--text-primary))]
        "
      />
    </label>
  );
}