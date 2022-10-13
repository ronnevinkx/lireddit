import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useMeQuery } from '../__generated__/graphql';

export const useIsAuth = (): void => {
	const { data, loading } = useMeQuery();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !data?.me) {
			// user not logged in
			router.replace('/login?next=' + router.pathname);
		}
	}, [loading, data, router]);
};
