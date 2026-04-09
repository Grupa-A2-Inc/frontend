type Props = {
  variant: "success" | "error";
  message: string;
};

export default function AdminStatusBanner({ variant, message }: Props) {
  const classes =
    variant === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}