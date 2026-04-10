"use client";

import { useState } from "react";
import { OrganizationProfile } from "@/lib/admin-dashboard/types";
import {
  getOrganizationIdFromStorage,
  updateOrganizationById,
} from "@/lib/admin-dashboard/api";
import AdminStatusBanner from "./AdminStatusBanner";

type Props = {
  initialValues: OrganizationProfile;
  onCancel: () => void;
  onSuccess: () => void;
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

  function setField<K extends keyof OrganizationProfile>(
    field: K,
    value: OrganizationProfile[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const organizationId = getOrganizationIdFromStorage();

    if (!organizationId) {
      setErrorMessage("Organization ID was not found in the current session.");
      return;
    }

    setIsSaving(true);

    try {
      await updateOrganizationById(organizationId, form);
      setSuccessMessage("Organization details were updated successfully.");

      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
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
      {errorMessage ? (
        <AdminStatusBanner variant="error" message={errorMessage} />
      ) : null}

      {successMessage ? (
        <AdminStatusBanner variant="success" message={successMessage} />
      ) : null}

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

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

function Field({ label, value, onChange, required }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
      />
    </label>
  );
}