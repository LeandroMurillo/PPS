import { Navigate, useParams } from 'react-router-dom';

export default function AdminCategoriaDetallePage() {
	const { categoriaSlug } = useParams<{ categoriaSlug: string }>();

	return <Navigate to={categoriaSlug ? `/categorias/${categoriaSlug}/subcategorias` : '/categorias'} replace />;
}
