'use client';

import { memo, useState } from 'react';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { formatWholePrice } from '@/lib/format';
import s from './booking.module.css';

const FIRST = 3;

/** Add-ons as plain checkbox rows (one each). The first three show; the rest behind "More". */
export const AddOnList = memo(function AddOnList({ addOns, picked, onToggle }: { addOns: AddOnListItemResponse[]; picked: Record<string, number>; onToggle: (id: string, on: boolean) => void }) {
	const [all, setAll] = useState(false);
	const shown = all ? addOns : addOns.slice(0, FIRST);
	return (
		<div>
			<div className={s.addons}>
				{shown.map((a) => (
					<label key={a.id} className={s.addon}>
						<input type="checkbox" checked={Boolean(picked[a.id])} onChange={(e) => onToggle(a.id, e.target.checked)} />
						<span>
							<span className={s.addonTitle}>{a.title}</span>
							{a.description ? <span className={s.addonDesc}>{a.description}</span> : null}
						</span>
						<span className={s.addonPrice}>+{formatWholePrice(a.price)}</span>
					</label>
				))}
			</div>
			{addOns.length > FIRST ? (
				<button type="button" className={`${s.linkish} ${s.more}`} onClick={() => setAll((v) => !v)}>
					{all ? 'Fewer extras' : `${addOns.length - FIRST} more extras`}
				</button>
			) : null}
		</div>
	);
});
