import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useMeQuery } from '../__generated__/graphql';

export const useIsNotAuth = (): void => {
	const { data, loading } = useMeQuery();
	const router = useRouter();

	useEffect(() => {
		if (!loading && data?.me) {
			// user is logged in, reroute to home
			router.replace('/');
		}
	}, [loading, data, router]);
};
