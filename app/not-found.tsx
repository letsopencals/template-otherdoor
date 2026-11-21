import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="wrap grid min-h-[78vh] place-items-center pt-[var(--header-h)] text-center">
			<div>
				<p className="label justify-center">404</p>
				<h1 className="font-display mt-6 text-[clamp(2.6rem,6vw,4.6rem)] leading-none tracking-tight">This door leads nowhere.</h1>
				<p className="mx-auto mt-5 max-w-md text-ink-2">Wrong turn in the corridor. The six that open are this way.</p>
				<p className="mt-9 flex justify-center gap-3">
					<Link href="/rooms" className="btn">See the rooms</Link>
					<Link href="/" className="btn btn-glass">Back to the corridor</Link>
				</p>
			</div>
		</div>
	);
}
