'use client';

import { useEffect, useState } from 'react';
import AddUser from '@/components/sub/slideouts/add-user';
import { apiGet } from '@/providers/apiRequest';

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Site {
  name: string;
  users: User[];
}

interface TransformedSite {
  name: string;
  people: {
    name: string;
    email: string;
    title: string;
    role: string;
  }[];
}

export default function CreateUser() {
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [locations, setLocations] = useState<TransformedSite[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response: Site[] = await apiGet(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1/auth/site/users/');

        if (!response || !Array.isArray(response)) {
          console.error('Invalid response format or no data from server');
          return;
        }

        const transformedData: TransformedSite[] = response.map((site) => ({
          name: site.name,
          people: site.users.map((user) => ({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            title: 'User',
            role: 'Member',
          })),
        }));

        setLocations(transformedData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, title, email, and role.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setSlideOverOpen(true)}
          >
            Add user
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        {locations.map((location) => (
          <div key={location.name} className="mb-4">
            <div className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3 rounded-md">
              {location.name}
            </div>
            <div className="mt-2">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {location.people.map((person, personIdx) => (
                    <tr
                      key={person.email}
                      className={personIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                        {person.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.role}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Edit<span className="sr-only">, {person.name}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <AddUser open={isSlideOverOpen} setOpen={setSlideOverOpen} />
    </div>
  );
}