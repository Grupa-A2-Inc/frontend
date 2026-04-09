type Props = {
  label: string;
  value: number;
  helperText?: string;
};

export default function AdminKpiCard({ label, value, helperText }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {helperText ? (
        <p className="mt-2 text-xs text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
}