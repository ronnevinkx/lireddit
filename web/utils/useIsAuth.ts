import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useMeQuery } from '../__generated__/graphql';

export const useIsAuth = (): void => {
	const [{ data, fetching }] = useMeQuery();
	const router = useRouter();

	useEffect(() => {
		if (!fetching && !data?.me) {
			// user not logged in
			router.replace('/login?next=' + router.pathname);
		}
	}, [fetching, data, router]);
};
