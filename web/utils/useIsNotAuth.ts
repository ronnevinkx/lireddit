import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useMeQuery } from '../__generated__/graphql';

export const useIsNotAuth = (): void => {
	const [{ data, fetching }] = useMeQuery();
	const router = useRouter();

	useEffect(() => {
		if (!fetching && data?.me) {
			// user is logged in, reroute to home
			router.replace('/');
		}
	}, [fetching, data, router]);
};
