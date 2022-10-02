import React from 'react';
import Image from 'next/image';
import { BiLoader } from 'react-icons/bi';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useQueryStatus } from '../hooks/useQueryStatus';
import { Counter } from '../components/Counter';
import { Button } from '../components/Button';
import snail from '../../public/snail.svg';
import { trpc } from '../utils/trpc';
import { UseQueryResult } from 'react-query';

export default function Home() {
	const session = useSession();
	const userCountQuery = trpc.useQuery(['twitterUser.count']);
	const tweetCountQuery = trpc.useQuery(['tweet.count']);

	function onLogin() {
		signIn('twitter');
	}

	return (
		<>
			<Header />
			<div>
				<div className="flex justify-center items-center py-10">
					<h1 className="text-5xl font-serif font-semibold max-w-xl text-center">
						Recording My (
						<span className="underline underline-blue-300">
							and yours
						</span>
						) Twitter Journey 🐌
					</h1>

					<Image src={snail} alt="snail" />
				</div>
				<div className="text-center mt-5">
					{session.status === 'loading' ? (
						<BiLoader className="text-black inline-block text-5xl opacity-80 animate-spin animate-duration-3000" />
					) : session.status === 'authenticated' ? (
						<p>
							Check your jour journey:{' '}
							<button>Go to timeline </button>
						</p>
					) : (
						<p className="text-2xl">
							<button
								onClick={onLogin}
								className="shadow-lg rounded bg-blue-400 py-0.5 px-3 text-white mr-1 uppercase"
							>
								Sign up
							</button>{' '}
							and start recording your journey
						</p>
					)}
				</div>
				<div className="flex justify-center children:(text-center m-2) mt-10">
					<Count label="Tweets saved" query={tweetCountQuery} />
					<Count label="Users tracked" query={userCountQuery} />
				</div>
			</div>
		</>
	);
}

interface CountProps {
	query: UseQueryResult<number>;
	label: string;
}

function Count(props: CountProps) {
	const { label, query } = props;
	const status = useQueryStatus(query);

	return (
		<div className="text-center">
			<h5 className="opacity-80">{label}</h5>
			<p className="text-4xl">
				{status.isSuccess(query) ? (
					<Counter target={query.data} />
				) : (
					<BiLoader className="text-black inline-block text-5xl opacity-80 animate-spin animate-duration-3000" />
				)}
			</p>
		</div>
	);
}

function Header() {
	const session = useSession();

	function onLogin() {
		signIn('twitter');
	}

	if (session.status === 'loading' || !session.data) {
		return (
			<div className="bg-red-100 sticky top-0 inset-x-0">
				Not signed in <br />
				<Button onClick={onLogin}>Sign in</Button>
			</div>
		);
	}

	function onLogout() {
		signOut();
	}

	return (
		<div className="bg-blue-100 sticky top-0 inset-x-0">
			Signed in as {session.data.user?.name} <br />
			<Button onClick={onLogout}>Sign out</Button>
		</div>
	);
}
