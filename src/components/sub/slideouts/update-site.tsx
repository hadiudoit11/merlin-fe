import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiPost, apiGet, apiPatch } from '@/providers/apiRequest';
import { SiteUpdateProps, FormData, User } from '@/types';

export default function SiteUpdate({ open, setOpen, siteId }: SiteUpdateProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone_number: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip_code: '',
    legal_entity_name: '',
    contact_email: '',
    user: [],
  });
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToPatch = {
        ...formData,
        user: formData.user.map((user) => user.id),
      };

      await apiPatch(`http://localhost:8000/api/v1/auth/site/update/${siteId}/`, dataToPatch);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update site:', error);
    }
  };

  useEffect(() => {
    async function fetchSiteData() {
      if (!siteId) return;

      try {
        const siteResponse = await apiGet(`http://localhost:8000/api/v1/auth/site/detail/${siteId}/`);
        const allUsersResponse = await apiGet(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1/auth/organization/users/');
        
        setFormData({
          name: siteResponse.name || '',
          phone_number: siteResponse.phone_number || '',
          address_1: siteResponse.address_1 || '',
          address_2: siteResponse.address_2 || '',
          city: siteResponse.city || '',
          state: siteResponse.state || '',
          zip_code: siteResponse.zip_code || '',
          legal_entity_name: siteResponse.legal_entity_name || '',
          contact_email: siteResponse.contact_email || '',
          user: siteResponse.users || [],
        });

        setAllUsers(allUsersResponse || []);
        setFilteredUsers(allUsersResponse || []);
      } catch (error) {
        console.error('Failed to fetch site data:', error);
      }
    }

    if (open) {
      fetchSiteData();
    }
  }, [siteId, open]);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, allUsers]);

  const handleUserSelect = (user: User) => {
    setFormData((prev) => ({
      ...prev,
      user: [...prev.user, user],
    }));
  };

  const handleUserRemove = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      user: prev.user.filter((u) => u.id !== userId),
    }));
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form onSubmit={handleSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-orange-500 px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Update Site
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-orange-500 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="mt-4">
                          <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700">
                            Search Users
                          </label>
                          <input
                            type="text"
                            id="searchUsers"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Search for users to add"
                          />
                        </div>

                        <div className="mt-4">
                          {filteredUsers.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2">
                              <span>{user.first_name} {user.last_name}</span>
                              <span className="text-gray-500">{user.email}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            Update Site
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
    