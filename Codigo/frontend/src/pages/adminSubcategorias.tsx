import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useParams } from 'react-router-dom';

import { obtenerCategoriaAdmin, type CategoriaAdmin } from '../api/admin';
import SubcategoriasManager from '../components/subcategoriasManager';

export default function AdminSubcategoriasPage() {
	const { categoriaId } = useParams<{ categoriaId: string }>();
	const [categoria, setCategoria] = React.useState<CategoriaAdmin | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const controller = new AbortController();

		async function load() {
			if (!categoriaId) {
				setError('No se encontró la categoría solicitada.');
				setLoading(false);
				return;
			}

			try {
				const response = await obtenerCategoriaAdmin(categoriaId, controller.signal);
				setCategoria(response.data);
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
	}, [categoriaId]);

	const categoryName = categoria?.nombre ?? 'Categoría';

	return (
		<PageContainer
			title={``}
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
				<SubcategoriasManager categoryId={categoria.id} categoryName={categoria.nombre} showTitle={true} />
			) : null}
		</PageContainer>
	);
}
