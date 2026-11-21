import { Cutive_Mono, Gloock } from 'next/font/google';

/**
 * Gaslight No. 9's two faces (both unused by every other template, demo and world):
 * Gloock, a sharp high-contrast news display serif for mastheads and headlines;
 * Cutive Mono, a light typewriter face for telegrams, tickets and the detective's notes.
 */
export const gloock = Gloock({ subsets: ['latin'], weight: '400', variable: '--gl-display', display: 'swap' });
export const cutive = Cutive_Mono({ subsets: ['latin'], weight: '400', variable: '--gl-type', display: 'swap' });
