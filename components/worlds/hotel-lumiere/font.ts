import { Bowlby_One, Shantell_Sans } from 'next/font/google';

/**
 * Hôtel Lumière's two faces (both unused by every other template, demo and world):
 * Bowlby One, a heavy poster grotesque for the masthead, panel titles and sound effects;
 * Shantell Sans, a hand-lettered face with a bounce axis for balloons and captions.
 */
export const bowlby = Bowlby_One({ subsets: ['latin'], weight: '400', variable: '--lm-display', display: 'swap' });
export const shantell = Shantell_Sans({ subsets: ['latin'], weight: 'variable', axes: ['BNCE', 'INFM'], variable: '--lm-letter', display: 'swap' });
