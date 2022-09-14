import React from 'react';

type ReactButton = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>;

interface ButtonProps extends ReactButton {
	children: React.ReactNode;
}

export function Button(props: ButtonProps) {
	const { children, ...moreProps } = props;
	return (
		<button
			{...moreProps}
			className="p-ie-2 p-is-2 inline-flex rounded items-center h-10"
		>
			{children}
		</button>
	);
}
