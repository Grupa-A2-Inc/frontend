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
    success: "bg-green-500/10 border-green-500/30 text-green-300",
    error: "bg-red-500/10 border-red-500/30 text-red-300",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  };

  // Mapam fiecare varianta la iconita ei
  const icons = {
    success: <FiCheckCircle className="text-green-400 text-xl" />,
    error: <FiXCircle className="text-red-400 text-xl" />,
    warning: <FiAlertTriangle className="text-yellow-400 text-xl" />,
  };

  return (
    <div 
      className={`
        rounded-xl 
        border 
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