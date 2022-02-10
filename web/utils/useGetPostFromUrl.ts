import { usePostQuery } from '../__generated__/graphql';
import { useGetIntId } from './useGetIntId';

export const useGetPostFromUrl = () => {
	const intId = useGetIntId();

	return usePostQuery({
		skip: intId === -1,
		variables: { id: intId }
	});
};
