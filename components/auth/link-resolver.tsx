'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MagicLinkErrorCode } from '@opencals/storefront-sdk';
import { resolveLink } from '@/app/auth/actions/resolve-link';
import { normalizeRedirect } from '@/lib/link-redirect';
import { AuthCard } from './auth-card';

const COPY: Record<MagicLinkErrorCode, { title: string; message: string }> = {
	TOKEN_EXPIRED: { title: 'This link has faded', message: 'Email links expire to keep your bookings safe. Sign in with a code instead.' },
	TOKEN_USED: { title: 'Link already used', message: 'Each link opens once. Sign in with a code to carry on.' },
	TOKEN_INVALID: { title: 'We can’t read this link', message: 'It may be cut short. Copy the whole link from the email, or sign in with a code.' },
};

/** Magic-link landing from booking emails: resolves once, then opens the target. */
export function LinkResolver({ token }: { token: string }) {
	const router = useRouter();
	const [status, setStatus] = useState<'resolving' | 'error'>('resolving');
	const [code, setCode] = useState<MagicLinkErrorCode>('TOKEN_INVALID');
	const ran = useRef(false);
	useEffect(() => {
		if (!token || ran.current) return;
		ran.current = true;
		(async () => {
			try {
				const r = await resolveLink(token);
				if (r.success && r.redirectPath) {
					router.replace(normalizeRedirect(r.redirectPath));
					router.refresh();
					return;
				}
				setCode(r.errorCode ?? 'TOKEN_INVALID');
			} catch {
				setCode('TOKEN_INVALID');
			}
			setStatus('error');
		})();
	}, [token, router]);
	if (status === 'resolving') return <AuthCard kicker="One moment" title="Opening your letter…" />;
	const c = COPY[code];
	return (
		<AuthCard kicker="The reading room" title={c.title} intro={c.message}>
			<Link href="/login" className="plate w-full">
				Sign in with a code
			</Link>
		</AuthCard>
	);
}
