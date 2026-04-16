// Definim tipurile de date pe care componenta le are ca proprietati
type Props = {
  label: string;
  value: number;
  helperText?: string;
};

export default function AdminKpiCard({ label, value, helperText }: Props) {
  return (
    <div 
      className="
        rounded-2xl
        border-[rgb(var(--border))]
        bg-[rgb(var(--bg-card))]
        backdrop-blur-sm
        p-5
        shadow-sm
        transition

        cursor-pointer
        hover:scale-[1.02]

        hover:bg-[rgb(var(--bg-card-hover))]
        hover:border-[rgb(var(--border-hover))]

        duration-150
        ease-out
      "
    >
      {/* Label-ul KPI-ului */}
      <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
        {label}
      </p>

      {/* Valoarea KPI-ului */}
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[rgb(var(--text-primary))]">
        {value}
      </p>

      {/* Text optional afisat sub valoare, doar daca exista */}
      {helperText ? (
        <p className="mt-2 text-xs text-[rgb(var(--text-secondary))]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}