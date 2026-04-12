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
        border 
        border-white/10
        bg-white/5 
        backdrop-blur-sm
        p-5
        shadow-sm
        transition
        hover:bg-white/10
        hover:border-white/20
      "
    >
      {/* Label-ul KPI-ului */}
      <p className="text-sm font-medium text-gray-400">
        {label}
      </p>

      {/* Valoarea KPI-ului */}
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      {/* Text optional afisat sub valoare, doar daca exista */}
      {helperText ? (
        <p className="mt-2 text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}