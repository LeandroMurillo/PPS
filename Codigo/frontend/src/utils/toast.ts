import { toast, type ToastOptions } from 'react-toastify';

/**
 * Utilidad centralizada para mostrar notificaciones Toast.
 */
export const notify = {
	success: (message: string, options?: ToastOptions) =>
		toast.success(message, {
			toastId: message,
			autoClose: 5432,
			...options,
		}),

	error: (message: string, options?: ToastOptions) =>
		toast.error(message, {
			toastId: message,
			autoClose: 12345,
			hideProgressBar: true,
			...options,
		}),

	info: (message: string, options?: ToastOptions) =>
		toast.info(message, {
			toastId: message,
			autoClose: 5432,
			...options,
		}),

	warning: (message: string, options?: ToastOptions) =>
		toast.warning(message, {
			toastId: message,
			autoClose: 5432,
			...options,
		}),
};

export { toast };
