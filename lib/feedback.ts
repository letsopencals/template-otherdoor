import type { FeedbackQuestionResponse } from '@opencals/storefront-sdk';

/** A feedback question ("How was your class?") as the account page renders it. */
export interface FeedbackQuestionView extends Pick<FeedbackQuestionResponse, 'id' | 'type' | 'required'> {
	title: string;
	description: string | null;
	options: string[];
}
