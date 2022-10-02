import React from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../../../utils/trpc';

export default function User() {
	const router = useRouter();
	const [selectedUser, setSelectedUser] = React.useState<
		string | null
	>(null);
	const usersQuery = trpc.useQuery(['twitterUser.find']);

	if (usersQuery.status === 'error') {
		if (usersQuery.error.data?.code === 'UNAUTHORIZED') {
			router.replace('/');
		}
	}

	function showSnapshots(id: string) {
		setSelectedUser(id);
	}

	function onClose() {
		setSelectedUser(null);
	}

	const { data: users = [] } = usersQuery;

	return (
		<div className="max-w-4xl mx-auto px-6">
			<table>
				<thead>
					<tr>
						<th>id</th>
						<th>username</th>
						<th>last time checked</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => {
						const { id, lastTimeChecked, snapshots } = user;
						const username = snapshots[0]?.username;

						return (
							<tr key={id} className="p-2">
								<td>
									<div className="rounded-full overflow-hidden m-2">
										{id}
									</div>
								</td>
								<td>{username}</td>
								<td>{lastTimeChecked.toLocaleDateString('US')}</td>
								<td>
									<button onClick={() => showSnapshots(id)}>
										see snapshots
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{selectedUser && (
				<Snapshots userId={selectedUser} onClose={onClose} />
			)}
		</div>
	);
}

interface SnapshotsProps {
	userId: string;
	onClose: () => void;
}

function Snapshots(props: SnapshotsProps) {
	const { userId, onClose } = props;

	const snapshotsQuery = trpc.useQuery([
		'twitterUser.snapshopts',
		{
			id: userId,
		},
	]);

	const { data: snapshots = [] } = snapshotsQuery;

	return (
		<div className="fixed flex justify-center items-center inset-0 ">
			<div
				className="bg-black bg-opacity-40 inset-0 absolute"
				onClick={onClose}
			/>
			<div className="bg-white shadow relative max-w-lg">
				<button onClick={onClose}>close</button>
				<table>
					<thead>
						<tr>
							<th>username</th>
							<th>name</th>
							<th>No. tweets</th>
							<th>followers</th>
							<th>following</th>
							<th>Pinned tweet</th>
							<th>bio</th>
							<th>location</th>
							<th>website</th>
							<th>create at</th>
							<th>verified</th>
						</tr>
					</thead>
					<tbody>
						{snapshots.map((snapshot) => {
							const {
								id,
								username,
								name,
								tweetCount,
								followerCount,
								followingCount,
								pinnedTweetId,
								bio,
								location,
								website,
								createdAt,
								verified,
							} = snapshot;

							return (
								<tr key={id} className="p-2">
									<th>{username}</th>
									<th>{name}</th>
									<th>{tweetCount}</th>
									<th>{followerCount}</th>
									<th>{followingCount}</th>
									<th>{pinnedTweetId}</th>
									<th>{bio}</th>
									<th>{location}</th>
									<th>{website}</th>
									<th>{createdAt.toLocaleDateString('US')}</th>
									<th>{verified ? '✅' : '❎'}</th>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
