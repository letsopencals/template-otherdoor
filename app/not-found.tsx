import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="wrap grid min-h-[70vh] place-items-center pt-[var(--header-h)] text-center">
			<div>
				<p className="folio">Page missing from the archive</p>
				<h1 className="font-display mt-6 text-5xl">This volume isn’t on our shelf.</h1>
				<p className="mx-auto mt-4 max-w-md">The map you followed is older than ours. Try the shelf instead.</p>
				<p className="mt-8 flex justify-center gap-3">
					<Link href="/rooms" className="plate">See the rooms</Link>
					<Link href="/" className="plate plate-ghost">Back to the hall</Link>
				</p>
			</div>
		</div>
	);
}
