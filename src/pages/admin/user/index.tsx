import Image from 'next/image';
import { useRouter } from 'next/router';
import { trpc } from '../../../utils/trpc';

export default function User() {
	const router = useRouter();
	const usersQuery = trpc.useQuery(['user.find']);

	if (usersQuery.status === 'error') {
		if (usersQuery.error.data?.code === 'UNAUTHORIZED') {
			router.replace('/');
		}
	}

	const { data: users = [] } = usersQuery;

	return (
		<div className="max-w-4xl mx-auto px-6">
			<table>
				<thead>
					<tr>
						<th></th>
						<th>name</th>
						<th>roles</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => {
						const { id, name, image, roles } = user;
						return (
							<tr key={id} className="p-2">
								<td>
									<div className="rounded-full overflow-hidden m-2">
										{image && (
											<Image
												alt={name}
												src={image}
												width={20}
												height={20}
											/>
										)}
									</div>
								</td>
								<td>{name}</td>
								<td>{roles}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
