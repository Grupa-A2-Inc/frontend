"use client";

import { useState } from "react";
import { OrganizationProfile } from "@/lib/admin-dashboard/types";
import OrganizationInlineEditForm from "./OrganizationInlineEditForm";

import { getOrganizationById } from "@/lib/admin-dashboard/api";

type Props = {
  organization: OrganizationProfile; // datele organizatiei afisate in card
  onOrganizationUpdated: (org: OrganizationProfile) => void;
};

export default function OrganizationSummaryCard({
  organization,
  onOrganizationUpdated,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  // Controleaza daca afisam formularul de editare sau doar informatiile
  // false = modeul de vizualizare, true = modul de editare

  return (
    <div 
      className="
        rounded-2xl 
        border-[rgb(var(--border))] 
        bg-[rgb(var(--bg-card))] 
        p-6 
        shadow-sm
      "
    >
      {/* Header-ul cardului: titlu + descriere + buton Edit */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Organization Summary</h2>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Basic organization information and quick editing.
          </p>
        </div>

        {/* Butonul Edit apare doar cand NU suntem in modul de editare */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="
              rounded-lg 
              border-[rgb(var(--border))] 
              text-[rgb(var(--text-primary))]
              px-3 py-2 text-sm font-medium 

              cursor-pointer
              transition
              duration-150
              ease-out
              hover:scale-[1.02]

              hover:bg-[rgb(var(--bg-card-hover))]
              hover:border-[rgb(var(--border-hover))]  
            "
          >
            Edit
          </button>
        )}
      </div>

      {/* Daca este activ modul de editare, afisam formularul */}
      {isEditing ? (
        <OrganizationInlineEditForm
          initialValues={organization}
          onCancel={() => setIsEditing(false)} // Revine la modul de vizualizare

          onSuccess={async (updatedOrganization) => {
            setIsEditing(false); // inchide formularul

            // Reincarca organizatia din backend
            const id = updatedOrganization.id;
            const fresh = await getOrganizationById(id);

            onOrganizationUpdated(fresh);
          }}
        />
      ) : (
        // Daca NU editam, afisam informatiile organizatiei in grid
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
    <div className="rounded-xl border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-4">
      {/* Label-ul campului (ex: Organization Name) */}
      <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
        {label}
      </p>

      {/* Valoarea campului (ex: Scoala Ion) */}
      <p className="mt-2 text-sm font-medium text-[rgb(var(--text-primary))]">
        {value}
      </p>
    </div>
  );
}