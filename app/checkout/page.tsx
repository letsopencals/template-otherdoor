import { CheckoutProvider } from '@/contexts/checkout-context';
import { LetterOfPassage } from '@/components/checkout/letter-of-passage';

export default function CheckoutPage() {
	return (
		<CheckoutProvider>
			<LetterOfPassage />
		</CheckoutProvider>
	);
}
