import type { ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

const ALLOWED_MARKDOWN_ELEMENTS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'] as const;

type MarkdownContentProps = {
	children: string;
	sx?: SxProps<Theme>;
};

function isSafeUrl(url?: string): boolean {
	if (!url) return false;
	const trimmed = url.trim();
	try {
		const parsed = new URL(trimmed, 'https://culturatucuman.gob.ar');
		return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
	} catch {
		return false;
	}
}

function MarkdownLink({ node, href, children, ...props }: ComponentProps<'a'> & { node?: unknown }) {
	void node;

	if (!href || !isSafeUrl(href)) {
		return <span>{children}</span>;
	}

	return (
		<Link href={href} {...props} target="_blank" rel="noopener noreferrer" underline="hover">
			{children}
		</Link>
	);
}

export default function MarkdownContent({ children, sx }: MarkdownContentProps) {
	return (
		<Box
			sx={[
				{
					color: 'text.primary',
					lineHeight: 1.7,
					overflowWrap: 'anywhere',
					'& > :first-of-type': { mt: 0 },
					'& > :last-child': { mb: 0 },
					'& p': { my: 1.25 },
					'& ul, & ol': { my: 1.25, pl: 3.5 },
					'& li': { pl: 0.5 },
					'& li + li': { mt: 0.5 },
					'& strong': { fontWeight: 700 },
				},
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				skipHtml
				allowedElements={[...ALLOWED_MARKDOWN_ELEMENTS]}
				unwrapDisallowed
				components={{ a: MarkdownLink }}
			>
				{children}
			</ReactMarkdown>
		</Box>
	);
}
