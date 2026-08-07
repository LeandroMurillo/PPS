import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

import type { SortDirection } from '../api/admin';

export type AdminColumn<T, S extends string> = {
	id: string;
	label: string;
	sortBy?: S;
	minWidth?: number;
	align?: 'left' | 'right' | 'center';
	render: (row: T) => React.ReactNode;
};

type AdminTableProps<T, S extends string> = {
	columns: AdminColumn<T, S>[];
	rows: T[];
	getRowId: (row: T) => React.Key;
	total: number;
	page: number;
	pageSize: number;
	sortBy: S;
	sortDir: SortDirection;
	loading: boolean;
	error: string | null;
	emptyMessage: string;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	onSortChange: (sortBy: S, sortDir: SortDirection) => void;
};

export default function AdminTable<T, S extends string>({
	columns,
	rows,
	getRowId,
	total,
	page,
	pageSize,
	sortBy,
	sortDir,
	loading,
	error,
	emptyMessage,
	onPageChange,
	onPageSizeChange,
	onSortChange,
}: AdminTableProps<T, S>) {
	const handleSort = (columnSortBy: S) => {
		onSortChange(columnSortBy, sortBy === columnSortBy && sortDir === 'ASC' ? 'DESC' : 'ASC');
	};

	return (
		<Paper variant="outlined" sx={{ overflow: 'hidden', position: 'relative' }}>
			{loading && <LinearProgress sx={{ position: 'absolute', inset: '0 0 auto', zIndex: 2 }} />}
			{error && (
				<Box sx={{ p: 2 }}>
					<Alert severity="error">{error}</Alert>
				</Box>
			)}
			<TableContainer sx={{ maxHeight: 'calc(100vh - 330px)', minHeight: 320 }}>
				<Table stickyHeader size="small" aria-label="Listado administrativo">
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell
									key={column.id}
									align={column.align}
									sx={{ minWidth: column.minWidth, fontWeight: 700, whiteSpace: 'nowrap' }}
								>
									{column.sortBy ? (
										<TableSortLabel
											active={sortBy === column.sortBy}
											direction={
												sortBy === column.sortBy && sortDir === 'DESC' ? 'desc' : 'asc'
											}
											onClick={() => handleSort(column.sortBy as S)}
										>
											{column.label}
										</TableSortLabel>
									) : (
										column.label
									)}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{loading && rows.length === 0
							? Array.from({ length: Math.min(pageSize, 8) }, (_, index) => (
									<TableRow key={`skeleton-${index}`}>
										{columns.map((column) => (
											<TableCell key={column.id}>
												<Skeleton />
											</TableCell>
										))}
									</TableRow>
								))
							: rows.map((row) => (
									<TableRow hover key={getRowId(row)}>
										{columns.map((column) => (
											<TableCell key={column.id} align={column.align}>
												{column.render(row)}
											</TableCell>
										))}
									</TableRow>
								))}
						{!loading && !error && rows.length === 0 && (
							<TableRow>
								<TableCell colSpan={columns.length}>
									<Typography color="text.secondary" align="center" sx={{ py: 8 }}>
										{emptyMessage}
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				component="div"
				count={total}
				page={page}
				rowsPerPage={pageSize}
				rowsPerPageOptions={[10, 25, 50, 100]}
				onPageChange={(_event, nextPage) => onPageChange(nextPage)}
				onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
				labelRowsPerPage="Filas por página:"
				labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
			/>
		</Paper>
	);
}
