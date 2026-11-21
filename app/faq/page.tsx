import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { FaqCards } from '@/components/ui/faq-cards';

export const metadata: Metadata = { title: 'Questions', description: 'Arrival, ages, fear ratings, accessibility, cancellations and offers at The Gilded Compass escape rooms in Edinburgh.' };

export default function FaqPage() {
	const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: siteConfig.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
	return (
		<>
			<PageHead folio="Before you come" title="Questions explorers ask." />
			<section className="wrap max-w-4xl py-16 pb-24">
				<FaqCards items={siteConfig.faq} />
			</section>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
		</>
	);
}
