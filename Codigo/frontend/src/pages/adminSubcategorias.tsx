import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { PageContainer } from '@toolpad/core/PageContainer';

import { listarCategoriasAdmin, obtenerCategoriaAdmin, type CategoriaAdmin } from '../api/admin';
import SubcategoriasManager from '../components/subcategoriasManager';
import { buildSlugSinId, parseIdDesdeSlug, slugify } from '../utils/slug';

export default function AdminSubcategoriasPage() {
	const navigate = useNavigate();
	const { categoriaSlug = '' } = useParams<{ categoriaSlug: string }>();
	const [categoria, setCategoria] = React.useState<CategoriaAdmin | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const controller = new AbortController();

		async function load() {
			if (!categoriaSlug) {
				setError('No se encontró la categoría solicitada.');
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				let resolvedCat: CategoriaAdmin | null = null;
				const directId = parseIdDesdeSlug(categoriaSlug);

				if (directId) {
					try {
						const res = await obtenerCategoriaAdmin(directId, controller.signal);
						resolvedCat = res.data;
					} catch {
						// Ignorar si falla la resolución por ID directo y buscar en el listado
					}
				}

				if (!resolvedCat) {
					const listRes = await listarCategoriasAdmin(
						{ limit: 100, offset: 0, sortBy: 'nombre', sortDir: 'ASC' },
						controller.signal,
					);
					resolvedCat =
						listRes.data.find(
							(cat) =>
								buildSlugSinId(cat.nombre, cat.id) === categoriaSlug ||
								slugify(cat.nombre) === categoriaSlug,
						) ?? null;
				}

				if (!resolvedCat) {
					setError('No se encontró la categoría solicitada.');
				} else {
					setCategoria(resolvedCat);
					const canonicalSlug = buildSlugSinId(resolvedCat.nombre, resolvedCat.id);
					if (categoriaSlug !== canonicalSlug) {
						navigate(`/categorias/${canonicalSlug}/subcategorias`, { replace: true });
					}
				}
			} catch (loadError) {
				if (!controller.signal.aborted) {
					setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la categoría.');
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}

		void load();
		return () => controller.abort();
	}, [categoriaSlug, navigate]);

	const categoryName = categoria?.nombre ?? 'Categoría';

	return (
		<PageContainer
			title=""
			breadcrumbs={[
				{ title: 'Mapa', path: '/' },
				{ title: 'Categorías', path: '/categorias' },
				{ title: categoryName },
				{ title: 'Subcategorías' },
			]}
			maxWidth={false}
			sx={{ width: '100%', maxWidth: 'none' }}
		>
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error">{error}</Alert>
			) : categoria ? (
				<SubcategoriasManager
					categoryId={categoria.id}
					categoryName={categoria.nombre}
					categorySlug={categoriaSlug}
					showTitle={true}
				/>
			) : null}
		</PageContainer>
	);
}
