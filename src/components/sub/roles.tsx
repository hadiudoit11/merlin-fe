'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/providers/apiRequest';
import AddRole from './slideouts/add-role';
import { Permission } from '@/types';
import type { Role as RoleType } from '@/types';

interface RoleComponentProps {
  role: RoleType;
  permissions?: Permission[];
  onEdit?: (roleId: string) => void;
  onDelete?: (roleId: string) => void;
}

export default function Roles() {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const data: RoleType[] = await apiGet(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1/access/roles/');
        if (!data) {
          console.error('Response is undefined');
          return;
        }

        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          setRoles(data);
        } else {
          console.error('Fetched data is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const handleEditClick = (role: RoleType) => {
    setSelectedRole(role);
    setSlideOverOpen(true);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="bg-white px-8 pb-20 pt-16 lg:px-8 lg:pb-8 lg:pt-8 rounded-lg">
      <div className="relative mx-auto max-w-lg divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700">
              A list of all the roles in your organization including their name and description.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setSlideOverOpen(true)}
            >
              Add role
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {role.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {role.description}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleEditClick(role)}
                          >
                            Edit<span className="sr-only">, {role.name}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddRole open={isSlideOverOpen} setOpen={setSlideOverOpen} role={selectedRole} />
    </div>
  );
}