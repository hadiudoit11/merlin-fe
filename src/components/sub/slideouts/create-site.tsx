import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { apiPost, apiGet } from '@/providers/apiRequest';
import { SiteCreateProps, FormData, User } from '@/types';
import { useSession } from 'next-auth/react';

interface CreateSiteFormData extends Omit<FormData, 'user'> {
  user: string[]; // Store only user IDs
}

export default function SiteCreate({ open, setOpen }: SiteCreateProps) {
  const [formData, setFormData] = useState<CreateSiteFormData>({
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
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: session } = useSession();

  // Fetch all users when the component opens
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!open || !session?.user?.organization) return;
      
      console.log('Fetching all users');
      setIsLoading(true);
      
      try {
        // Use the correct environment variable
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
        console.log(`Using backend URL from env: ${backendURL}`);
        
        const response: User[] = await apiGet(`${backendURL}/api/v1/auth/organization/users/`);
        console.log('Fetched users:', response);
        
        if (Array.isArray(response)) {
          setAllUsers(response);
          setFilteredUsers([]); // Clear filtered users until search
        } else {
          console.error('Invalid response format:', response);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllUsers();
  }, [open, session]);

  // Filter users client-side based on search query
  const filterUsers = (query: string) => {
    console.log(`Filtering users with query: ${query}`);
    if (!query.trim()) {
      setFilteredUsers([]);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = allUsers.filter(user => 
      user.first_name?.toLowerCase().includes(lowercaseQuery) || 
      user.last_name?.toLowerCase().includes(lowercaseQuery) || 
      user.email?.toLowerCase().includes(lowercaseQuery)
    );
    
    console.log(`Found ${filtered.length} matching users`);
    setFilteredUsers(filtered);
  };

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    console.log(`Search query changed to: ${query}`);
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      console.log('Cleared previous search timeout');
    }
    
    // Set a new timeout for debounced filtering
    if (query.length >= 2) { // Only search if at least 2 characters
      console.log(`Setting timeout to filter for: ${query}`);
      searchTimeout.current = setTimeout(() => {
        console.log(`Timeout fired, filtering for: ${query}`);
        filterUsers(query);
      }, 300); // 300ms debounce time
    } else if (!query) {
      console.log('Empty query, clearing results');
      setFilteredUsers([]); // Clear results if query is empty
    }
  };

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setFilteredUsers([]);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = (user: User) => {
    setFormData((prev) => ({
      ...prev,
      user: [...prev.user, user.id],
    }));
    setSelectedUsers((prev) => [...prev, user]);
  };

  const handleRemoveUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      user: prev.user.filter((id) => id !== userId),
    }));
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:80';
      console.log(`Submitting form to: ${backendURL}/api/v1/auth/site/create/`);
      
      await apiPost(`${backendURL}/api/v1/auth/site/create/`, formData);
      setOpen(false);
    } catch (error) {
      console.error('Failed to create site:', error);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Create Site
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-12">
                          <div className="border-b border-gray-900/10 pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">Site Information</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              Please provide the details for the new site.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                              <div className="sm:col-span-4">
                                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                  Site Name
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-4">
                                <label htmlFor="legal_entity_name" className="block text-sm font-medium leading-6 text-gray-900">
                                  Legal Entity Name
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="legal_entity_name"
                                    id="legal_entity_name"
                                    value={formData.legal_entity_name}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-4">
                                <label htmlFor="contact_email" className="block text-sm font-medium leading-6 text-gray-900">
                                  Contact Email
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="email"
                                    name="contact_email"
                                    id="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-4">
                                <label htmlFor="phone_number" className="block text-sm font-medium leading-6 text-gray-900">
                                  Phone Number
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="phone_number"
                                    id="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-b border-gray-900/10 pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">Address Information</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              Provide the physical address for this site.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                              <div className="col-span-full">
                                <label htmlFor="address_1" className="block text-sm font-medium leading-6 text-gray-900">
                                  Address Line 1
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="address_1"
                                    id="address_1"
                                    value={formData.address_1}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="col-span-full">
                                <label htmlFor="address_2" className="block text-sm font-medium leading-6 text-gray-900">
                                  Address Line 2
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="address_2"
                                    id="address_2"
                                    value={formData.address_2}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-2 sm:col-start-1">
                                <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                                  City
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <label htmlFor="state" className="block text-sm font-medium leading-6 text-gray-900">
                                  State
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="state"
                                    id="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <label htmlFor="zip_code" className="block text-sm font-medium leading-6 text-gray-900">
                                  ZIP / Postal code
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="zip_code"
                                    id="zip_code"
                                    value={formData.zip_code}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-b border-gray-900/10 pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">Site Users</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              Add users who will have access to this site.
                            </p>

                            <div className="mt-6">
                              <label htmlFor="user-search" className="block text-sm font-medium leading-6 text-gray-900">
                                Search Users
                              </label>
                              <div className="mt-2 relative">
                                <input
                                  type="text"
                                  id="user-search"
                                  value={searchQuery}
                                  onChange={handleSearchChange}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  placeholder="Type to search users..."
                                  disabled={isLoading}
                                />
                                {isLoading && (
                                  <div className="absolute right-3 top-2">
                                    <div className="h-5 w-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 max-h-40 overflow-y-auto">
                              <ul className="divide-y divide-gray-100">
                                {isLoading ? (
                                  <li className="py-2 text-sm text-gray-500">Loading users...</li>
                                ) : filteredUsers.length > 0 ? (
                                  filteredUsers.map((user) => (
                                    <li key={user.id} className="flex justify-between gap-x-6 py-2">
                                      <div className="flex gap-x-4">
                                        <div className="min-w-0 flex-auto">
                                          <p className="text-sm font-semibold leading-6 text-gray-900">
                                            {user.first_name} {user.last_name}
                                          </p>
                                          <p className="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        {formData.user.includes(user.id) ? (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveUser(user.id)}
                                            className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
                                          >
                                            Remove
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleAddUser(user)}
                                            className="rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-600 shadow-sm hover:bg-green-100"
                                          >
                                            Add
                                          </button>
                                        )}
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  searchQuery.length > 0 ? (
                                    <li className="py-2 text-sm text-gray-500">No users found</li>
                                  ) : (
                                    <li className="py-2 text-sm text-gray-500">Type to search for users</li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div className="mt-4">
                              <h3 className="text-sm font-medium leading-6 text-gray-900">Selected Users</h3>
                              <ul className="mt-2 divide-y divide-gray-100">
                                {formData.user.length > 0 ? (
                                  selectedUsers.map((user) => (
                                    <li key={user.id} className="flex justify-between gap-x-6 py-2">
                                      <div className="flex gap-x-4">
                                        <div className="min-w-0 flex-auto">
                                          <p className="text-sm font-semibold leading-6 text-gray-900">
                                            {user.first_name} {user.last_name}
                                          </p>
                                          <p className="mt-1 truncate text-xs leading-5 text-gray-500">{user.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveUser(user.id)}
                                          className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  <li className="py-2 text-sm text-gray-500">No users selected</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-x-6">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-sm font-semibold leading-6 text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                          >
                            Create Site
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}