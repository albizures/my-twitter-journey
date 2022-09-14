import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '../components/Button';

export default function Home() {
	const session = useSession();

	function onLogin() {
		signIn('twitter');
	}

	if (session.status === 'loading' || !session.data) {
		return (
			<div className="bg-red-100">
				Not signed in <br />
				<Button onClick={onLogin}>Sign in</Button>
			</div>
		);
	}

	function onLogout() {
		signOut();
	}

	return (
		<div className="bg-blue-100">
			Signed in as {session.data.user?.name} <br />
			<Button onClick={onLogout}>Sign out</Button>
		</div>
	);
}
