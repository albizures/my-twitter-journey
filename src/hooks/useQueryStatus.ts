import React from 'react';
import {
	QueryObserverSuccessResult,
	UseQueryResult,
} from 'react-query';

export function useQueryStatus<T>(query: UseQueryResult<T>) {
	const [status, setStatus] = React.useState(query.status);
	const promiseRef = React.useRef<Promise<unknown>>();

	React.useEffect(() => {
		if (promiseRef.current) {
			promiseRef.current.then(() => {
				setStatus(query.status);
			});
		} else if (query.status === 'loading') {
			promiseRef.current = new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
		}
	}, [query.status]);
	return React.useMemo(() => {
		return {
			isSuccess(
				query: UseQueryResult<T>,
			): query is QueryObserverSuccessResult<T> {
				return status === 'success' && query.status === 'success';
			},
		};
	}, [status]);
}
