import { toast, type Id, type ToastOptions } from 'react-toastify';

export type NotifyOptions = ToastOptions & {
	/**
	 * Ámbito o contexto de la notificación (ej: 'login', 'perfil', 'password', 'actor').
	 * Si se emite una notificación de éxito con el mismo `scope`,
	 * se cierran automáticamente las notificaciones activas asociadas a dicho ámbito.
	 */
	scope?: string;
};

// Mapa para rastrear los IDs de toasts activos agrupados por scope
const activeScopedToasts = new Map<string, Set<Id>>();

function registerScopedToast(scope: string | undefined, id: Id) {
	if (!scope) return;
	if (!activeScopedToasts.has(scope)) {
		activeScopedToasts.set(scope, new Set());
	}
	activeScopedToasts.get(scope)!.add(id);
}

function dismissScopedToasts(scope: string | undefined) {
	if (!scope || !activeScopedToasts.has(scope)) return;
	const ids = activeScopedToasts.get(scope);
	if (ids) {
		for (const id of ids) {
			toast.dismiss(id);
		}
	}
	activeScopedToasts.delete(scope);
}

/**
 * Utilidad centralizada para mostrar notificaciones Toast con soporte para scopes.
 */
export const notify = {
	success: (message: string, options?: NotifyOptions): Id => {
		if (options?.scope) {
			dismissScopedToasts(options.scope);
		}
		const userOnClose = options?.onClose;
		const id = toast.success(message, {
			toastId: options?.toastId ?? message,
			autoClose: 5432,
			...options,
			onClose: (props) => {
				if (options?.scope && activeScopedToasts.has(options.scope)) {
					activeScopedToasts.get(options.scope)?.delete(id);
				}
				userOnClose?.(props);
			},
		});
		return id;
	},

	error: (message: string, options?: NotifyOptions): Id => {
		const userOnClose = options?.onClose;
		const id = toast.error(message, {
			toastId: options?.toastId ?? message,
			autoClose: 12345,
			hideProgressBar: true,
			...options,
			onClose: (props) => {
				if (options?.scope && activeScopedToasts.has(options.scope)) {
					activeScopedToasts.get(options.scope)?.delete(id);
				}
				userOnClose?.(props);
			},
		});
		if (options?.scope) {
			registerScopedToast(options.scope, id);
		}
		return id;
	},

	info: (message: string, options?: NotifyOptions): Id => {
		const userOnClose = options?.onClose;
		const id = toast.info(message, {
			toastId: options?.toastId ?? message,
			autoClose: 5432,
			...options,
			onClose: (props) => {
				if (options?.scope && activeScopedToasts.has(options.scope)) {
					activeScopedToasts.get(options.scope)?.delete(id);
				}
				userOnClose?.(props);
			},
		});
		return id;
	},

	warning: (message: string, options?: NotifyOptions): Id => {
		const userOnClose = options?.onClose;
		const id = toast.warning(message, {
			toastId: options?.toastId ?? message,
			autoClose: 5432,
			...options,
			onClose: (props) => {
				if (options?.scope && activeScopedToasts.has(options.scope)) {
					activeScopedToasts.get(options.scope)?.delete(id);
				}
				userOnClose?.(props);
			},
		});
		if (options?.scope) {
			registerScopedToast(options.scope, id);
		}
		return id;
	},

	dismissScope: (scope: string) => {
		dismissScopedToasts(scope);
	},

	dismiss: (id?: Id) => {
		toast.dismiss(id);
	},
};

export { toast };
