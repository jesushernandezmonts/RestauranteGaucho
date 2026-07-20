import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Configuración base de colores para que combine con el tema del restaurante
const baseConfig: SweetAlertOptions = {
  background: "#1B1512",
  color: "#F2E8D5",
  confirmButtonColor: "#D4A23A",
  cancelButtonColor: "#C4553A",
  customClass: {
    popup: "border border-[rgba(212,162,58,0.2)] rounded-2xl",
    confirmButton: "rounded-xl font-medium px-4 py-2",
    cancelButton: "rounded-xl font-medium px-4 py-2",
    title: "font-display",
  },
};

export const showSuccessAlert = (title: string, text?: string) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "success",
    iconColor: "#8BA877",
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "error",
    iconColor: "#C4553A",
  });
};

export const showWarningAlert = (title: string, text?: string) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    iconColor: "#E0C060",
  });
};

export const showConfirmAlert = async (
  title: string,
  text: string,
  confirmText = "Sí, confirmar",
  cancelText = "Cancelar"
): Promise<boolean> => {
  const result: SweetAlertResult = await MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    iconColor: "#E0C060",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
};
