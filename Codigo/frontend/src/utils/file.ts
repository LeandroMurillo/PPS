/**
 * Utilidades para manejo, validación y conversión de archivos en el frontend.
 */

export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject(new Error('No se pudo convertir el archivo a Base64.'));
			}
		};
		reader.onerror = () => reject(reader.error || new Error('Error al leer el archivo.'));
		reader.readAsDataURL(file);
	});
}

export function validateImageFile(
	file: File,
	maxSizeMB = 5,
): { valid: boolean; error?: string } {
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
		return {
			valid: false,
			error: `La imagen seleccionada pesa ${sizeInMB} MB. El tamaño máximo permitido es de ${maxSizeMB} MB.`,
		};
	}
	return { valid: true };
}
