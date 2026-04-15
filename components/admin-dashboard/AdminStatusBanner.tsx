import { FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";
// Importam iconitele pentru fiecare tip de mesaj

type Props = {
  variant: "success" | "error" | "warning";
  message: string;
};
// Definim tipurile acceptate pentru banner
// Mesajul este un simplu string afisat in banner

export default function AdminStatusBanner({ variant, message }: Props) {
  // Mapam fiecare varianta la stilurile ei vizuale in dark mode
  const classes = {
    success: 
      "bg-[rgb(var(--success-bg))] border-[rgb(var(--success-border))] text-[rgb(var(--success-text))]",
    error: 
      "bg-[rgb(var(--error-bg))] border-[rgb(var(--error-border))] text-[rgb(var(--error-text))]",
    warning: 
      "bg-[rgb(var(--warning-bg))] border-[rgb(var(--warning-border))] text-[rgb(var(--warning-text))]",
  };

  // Mapam fiecare varianta la iconita ei
  const icons = {
    success: (
      <FiCheckCircle className="text-[rgb(var(--success-text))] text-xl" />
    ),
    error: <FiXCircle className="text-[rgb(var(--error-text))] text-xl" />,
    warning: (
      <FiAlertTriangle className="text-[rgb(var(--warning-text))] text-xl" />
    ),
  };

  return (
    <div 
      className={`
        rounded-xl 
        border-[rgb(var(--border))] 
        bg-[rgb(var(--bg-card))]
        p-4
        flex
        items-center
        gap-3
        backdrop-blur-sm
        ${classes[variant]}
      `}
    >
      {icons[variant]}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}