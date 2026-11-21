import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { FaqCards } from '@/components/ui/faq-cards';

export const metadata: Metadata = { title: 'Questions', description: 'Arrival, ages, fear ratings, accessibility, cancellations and offers at Otherdoor escape rooms in Edinburgh.' };

export default function FaqPage() {
	const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: siteConfig.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
	return (
		<>
			<PageHead label="Before you come" title="Questions people ask." lede={`Anything else: ${siteConfig.contact.email} or ${siteConfig.contact.phone}.`} />
			<section className="wrap max-w-[1000px] py-16 pb-24">
				<FaqCards items={siteConfig.faq} />
			</section>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
		</>
	);
}
