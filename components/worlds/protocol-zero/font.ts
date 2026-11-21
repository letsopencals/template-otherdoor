import { Doto } from 'next/font/google';

/**
 * Protocol Zero's display face: a dot-matrix grotesk, like the instrument
 * readouts on lab equipment. Used only at display sizes (titles, module names,
 * the countdown); body copy stays in the shell's UI sans and the terminal in its mono.
 * Unused by any other template, demo or world.
 */
export const doto = Doto({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--font-pz', display: 'swap' });
