import React from 'react';

export interface CounterProps {
	target: number;
}

export function Counter(props: CounterProps) {
	const { target } = props;
	const [current, setCurrent] = React.useState(0);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setCurrent((current) => {
				if (current > target) {
					clearTimeout(interval);
					return target;
				} else {
					return current + 1;
				}
			});
		}, 100);

		return () => {
			clearTimeout(interval);
		};
	}, [target]);

	return <span>{current}</span>;
}
