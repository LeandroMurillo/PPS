// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import SurveyAnswerDisplay from './surveyAnswerDisplay';

describe('SurveyAnswerDisplay', () => {
	afterEach(() => {
		cleanup();
	});

	describe('cuando tipoDato está especificado', () => {
		it('renderiza TEXTO como texto plano sin hipervínculos ni íconos de enlace', () => {
			const { container } = render(<SurveyAnswerDisplay value="1" tipoDato="TEXTO" />);
			expect(screen.getByText('1')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
		});

		it('renderiza NUMERO como texto plano sin hipervínculos', () => {
			const { container } = render(<SurveyAnswerDisplay value={1} tipoDato="NUMERO" />);
			expect(screen.getByText('1')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
		});

		it('renderiza OPCION_UNICA como texto plano sin hipervínculos', () => {
			const { container } = render(<SurveyAnswerDisplay value="Solista" tipoDato="OPCION_UNICA" />);
			expect(screen.getByText('Solista')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
		});

		it('renderiza BOOLEANO como un Chip de Sí o No', () => {
			const { unmount } = render(<SurveyAnswerDisplay value={true} tipoDato="BOOLEANO" />);
			expect(screen.getByText('Sí')).toBeDefined();
			unmount();

			render(<SurveyAnswerDisplay value={false} tipoDato="BOOLEANO" />);
			expect(screen.getByText('No')).toBeDefined();
		});

		it('renderiza FECHA con formato legible en español', () => {
			render(<SurveyAnswerDisplay value="9999-08-29" tipoDato="FECHA" />);
			expect(screen.getByText(/29 de agosto/i)).toBeDefined();
		});

		it('renderiza URL válida como un enlace con icono de link', () => {
			const { container } = render(
				<SurveyAnswerDisplay value="https://instagram.com/artista" tipoDato="URL" />,
			);
			const link = container.querySelector('a');
			expect(link).not.toBeNull();
			expect(link?.getAttribute('href')).toBe('https://instagram.com/artista');
			expect(screen.getByText('instagram.com/artista')).toBeDefined();
		});

		it('renderiza URL inválida como texto plano en lugar de un enlace roto', () => {
			const { container } = render(<SurveyAnswerDisplay value="2" tipoDato="URL" />);
			expect(screen.getByText('2')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
		});

		it('renderiza EMAIL con enlace mailto:', () => {
			const { container } = render(<SurveyAnswerDisplay value="2@gmail.com" tipoDato="EMAIL" />);
			const link = container.querySelector('a');
			expect(link).not.toBeNull();
			expect(link?.getAttribute('href')).toBe('mailto:2@gmail.com');
			expect(screen.getByText('2@gmail.com')).toBeDefined();
		});

		it('renderiza TELEFONO con enlace telefónico o WhatsApp', () => {
			const { container } = render(<SurveyAnswerDisplay value="1111111" tipoDato="TELEFONO" />);
			const link = container.querySelector('a');
			expect(link).not.toBeNull();
			expect(link?.getAttribute('href')).toBe('tel:1111111');
			expect(screen.getByText('1111111')).toBeDefined();
		});

		it('renderiza TAGS y OPCION_MULTIPLE como Chips independientes', () => {
			render(
				<SurveyAnswerDisplay
					value={['Folklore', 'Rock Tucumano']}
					tipoDato="TAGS"
				/>,
			);
			expect(screen.getByText('Folklore')).toBeDefined();
			expect(screen.getByText('Rock Tucumano')).toBeDefined();
		});

		it('renderiza TAGS guardados como string separado por comas como Chips', () => {
			render(
				<SurveyAnswerDisplay
					value="Folklore, Rock Tucumano"
					tipoDato="TAGS"
				/>,
			);
			expect(screen.getByText('Folklore')).toBeDefined();
			expect(screen.getByText('Rock Tucumano')).toBeDefined();
		});
	});

	describe('cuando tipoDato NO está especificado (fallback heurístico)', () => {
		it('NO convierte números simples en enlaces ("1", "42")', () => {
			const { container } = render(<SurveyAnswerDisplay value="1" />);
			expect(screen.getByText('1')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
		});

		it('NO convierte palabras simples o géneros en enlaces ("Folklore", "Solista")', () => {
			const { container, unmount } = render(<SurveyAnswerDisplay value="Folklore" />);
			expect(screen.getByText('Folklore')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
			unmount();

			const { container: c2 } = render(<SurveyAnswerDisplay value="Solista" />);
			expect(screen.getByText('Solista')).toBeDefined();
			expect(c2.querySelector('a')).toBeNull();
		});

		it('NO convierte texto descriptivo en enlaces ("Diseño de Autor")', () => {
			const { container } = render(<SurveyAnswerDisplay value="Diseño de Autor" />);
			expect(screen.getByText('Diseño de Autor')).toBeDefined();
			expect(container.querySelector('a')).toBeNull();
		});

		it('formatea fechas automáticamente si coinciden con YYYY-MM-DD', () => {
			render(<SurveyAnswerDisplay value="9999-08-29" />);
			expect(screen.getByText(/29 de agosto/i)).toBeDefined();
		});

		it('reconoce correos electrónicos y crea enlaces mailto:', () => {
			const { container } = render(<SurveyAnswerDisplay value="2@gmail.com" />);
			const link = container.querySelector('a');
			expect(link).not.toBeNull();
			expect(link?.getAttribute('href')).toBe('mailto:2@gmail.com');
		});

		it('reconoce teléfonos y crea enlaces tel:/whatsapp', () => {
			const { container } = render(<SurveyAnswerDisplay value="1111111" />);
			const link = container.querySelector('a');
			expect(link).not.toBeNull();
			expect(link?.getAttribute('href')).toBe('tel:1111111');
		});

		it('solo crea enlaces web para URLs reales con dominio o protocolo', () => {
			const { container } = render(<SurveyAnswerDisplay value="https://mosaico.gob.ar" />);
			const link = container.querySelector('a');
			expect(link).not.toBeNull();
			expect(link?.getAttribute('href')).toBe('https://mosaico.gob.ar');
		});

		it('renderiza valor vacío si el dato es null o string en blanco', () => {
			render(<SurveyAnswerDisplay value="" emptyText="Sin respuesta" />);
			expect(screen.getByText('Sin respuesta')).toBeDefined();
		});
	});
});
