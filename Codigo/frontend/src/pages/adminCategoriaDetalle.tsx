import { Navigate, useParams } from 'react-router-dom';

export default function AdminCategoriaDetallePage() {
	const { categoriaId } = useParams<{ categoriaId: string }>();

	return <Navigate to={categoriaId ? `/categorias/${categoriaId}/subcategorias` : '/categorias'} replace />;
}
