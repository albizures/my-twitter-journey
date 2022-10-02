interface FaviconProps {
	icon: string;
}

export function Favicon(props: FaviconProps) {
	const { icon } = props;
	const svg = [
		'<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>',
		'<text y=%22.9em%22 font-size=%2290%22>',
		icon,
		'</text>',
		'</svg>',
	].join();
	return (
		<>
			<meta charSet="UTF-8" />
			<link rel="icon" href={`data:image/svg+xml,${svg}`} />
		</>
	);
}
