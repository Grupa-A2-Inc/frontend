"use client";

import { useState } from "react";
import { OrganizationProfile } from "@/lib/admin-dashboard/types";
import OrganizationInlineEditForm from "./OrganizationInlineEditForm";

type Props = {
  organization: OrganizationProfile;
  onOrganizationUpdated: () => void;
};

export default function OrganizationSummaryCard({
  organization,
  onOrganizationUpdated,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Organization Summary</h2>
          <p className="text-sm text-gray-500">
            Basic organization information and quick editing.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <OrganizationInlineEditForm
          initialValues={organization}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            onOrganizationUpdated();
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Organization Name" value={organization.organizationName} />
          <Info label="Organization Type" value={organization.organizationType} />
          <Info label="Country" value={organization.country} />
          <Info label="City" value={organization.city} />
          <Info label="Address" value={organization.address || "-"} />
          <Info label="Phone Number" value={organization.phoneNumber || "-"} />
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}