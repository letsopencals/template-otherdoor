'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { AuthCard } from './auth-card';

const emailSchema = z.string().min(1, 'Email is required').email('Please enter a valid email');
const field = 'mt-1 block h-12 w-full rounded-[8px] border border-[rgba(232,222,255,0.16)] bg-white/[0.04] px-3 text-[1rem] text-ink placeholder:text-ink-3 focus:border-[var(--door)] focus:outline-none';

/** Passwordless sign-in: email → 6-digit code (`login-code` provider). An account is made when a guest books. */
export function LoginForm({ callbackUrl, initialEmail = '' }: { callbackUrl: string; initialEmail?: string }) {
	const router = useRouter();
	const [step, setStep] = useState<'email' | 'code'>('email');
	const [email, setEmail] = useState(initialEmail);
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	const send = async () => {
		setError(null);
		const parsed = emailSchema.safeParse(email.trim());
		if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email');
		setLoading(true);
		try {
			const res = await fetch('/api/auth/request-login-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: parsed.data }) });
			if (!res.ok && res.status !== 404) throw new Error();
			setCooldown(60);
			setCode('');
			setStep('code');
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};
	const verify = async () => {
		setError(null);
		if (code.trim().length < 6) return setError('Enter the 6-digit code from your email.');
		setLoading(true);
		try {
			const r = await signIn('login-code', { email: email.trim(), code: code.trim(), redirect: false });
			if (r?.error) setError('That code is wrong or has expired. Try again.');
			else {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthCard
			kicker={step === 'email' ? 'Your account' : 'Code sent'}
			title={step === 'email' ? 'Sign in' : 'Check your inbox'}
			intro={step === 'email' ? 'Sign in to see your bookings, move or cancel one, and see which doors you have opened. No password: we email you a code.' : `Enter the 6-digit code we sent to ${email}.`}
			footer={
				<>
					No account yet? One is made when you book.{' '}
					<Link href="/book" className="link">
						Book a session
					</Link>
				</>
			}
		>
			{error ? <p className="mb-4 rounded-[8px] border-l-2 border-[#ff4358] bg-[#ff4358]/10 p-3 text-sm" role="alert">{error}</p> : null}
			{step === 'email' ? (
				<form onSubmit={(e) => { e.preventDefault(); void send(); }} className="space-y-5">
					<label className="block text-sm font-medium text-ink-2" htmlFor="login-email">
						Email
						<input id="login-email" type="email" enterKeyHint="send" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@example.com" />
					</label>
					<button type="submit" className="btn btn-block" disabled={loading}>
						{loading ? 'Sending…' : 'Email me a code'}
					</button>
				</form>
			) : (
				<form onSubmit={(e) => { e.preventDefault(); void verify(); }} className="space-y-5">
					<input type="text" inputMode="numeric" enterKeyHint="go" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} aria-label="6-digit code" placeholder="000000" className={`${field} mono h-16 text-center text-2xl tracking-[0.6em]`} />
					<button type="submit" className="btn btn-block" disabled={loading}>
						{loading ? 'Opening…' : 'Sign in'}
					</button>
					<div className="flex justify-between text-sm">
						<button type="button" className="underline disabled:opacity-40" disabled={cooldown > 0 || loading} onClick={() => void send()}>
							{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend the code'}
						</button>
						<button type="button" className="link" onClick={() => setStep('email')}>
							Different email
						</button>
					</div>
				</form>
			)}
		</AuthCard>
	);
}
