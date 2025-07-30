'use client';

import {useState, useEffect} from 'react';
import {Search, User, Shield, Globe, Home, Calendar} from 'lucide-react';
import {fetchBoth} from "@/utils/fetchboth";
import {AdminNav} from "@/components/adminNav";

interface User {
    username: string;
    uid: string;
    email: string;
    isDomestic: boolean;
    lastConfirm: string;
    isAdmin: string | null;
}

const timeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetchBoth('/api/getusers');
            const userData = await response.json();
            setUsers(userData.resp);
        };

        fetchUsers();
    }, []);
    console.log(users);

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(filter.toLowerCase())
    );

    console.log(users, filter, filteredUsers);
    const selectedUser: User = users.filter((user) => user.uid === selectedUserId)[0]

    return (
        <main className="flex min-h-screen flex-col items-center">
            <AdminNav/>
            <div className="h-5"/>
            <div className="flex gap-5">
                <div id="table" className="w-[800px] p-3">
                    <div id="header" className="flex flex-row justify-between pb-1">
                        <div
                            className="flex justify-center gap-[10px] group/search bg-primary/0 hover:bg-primary/100 text-inherit hover:text-secondary transition-all ease-in-out duration-300 rounded-lg py-[10px] px-[10px]">
                            <Search/>
                            <div onClick={(e) => e.stopPropagation()}>
                                <input
                                    className="text-inherit bg-inherit focus:outline-none peer"
                                    type="text"
                                    placeholder="search users..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                <div
                                    className="rounded-md w-[0%] peer-focus:w-[100%] group-hover/search:w-[100%] h-[3px] bg-secondary group-hover:bg/primary group-hover/search:bg-secondary transition-all ease-in-out duration-300 delay-100"/>
                            </div>
                        </div>
                        <div/>
                    </div>
                    <div className="w-full bg-primary rounded-xl h-1"/>

                    <div
                        className="flex flex-row justify-between align-middle p-3 text-primary/80">
                        <div className="w-[200px]">Username</div>
                        <div className="w-[250px]">Email</div>
                        <div className="w-[80px] text-center">Type</div>
                        <div className="w-[80px] text-center">Admin</div>
                        <div className="w-[100px] text-center">Last Confirm</div>
                    </div>
                    <div className="h-[2px] w-[802px] bg-gray-500"/>

                    <div className="flex flex-col gap-1 pt-1" id="users">
                        {filteredUsers.map((user, index) => {
                            const isSelected = selectedUserId === user.uid;

                            return (
                                <div
                                    className="flex flex-row justify-between align-middle p-3 rounded-xl bg-primary/0 hover:bg-primary/100 hover:text-secondary cursor-pointer duration-300 ease-in-out transition-all relative"
                                    key={`user_${user.uid}`}
                                    onClick={() => { // TODO - PASS INDEX TO SELECTED USER
                                        if (user.uid === selectedUserId) setSelectedUserId('');
                                        else setSelectedUserId(user.uid);
                                    }}
                                >
                                    <div
                                        className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${isSelected ? 'border-primary/100' : 'border-primary/0'} rounded-tl-2xl pointer-events-none transition-all duration-100 ease-in-out`}/>
                                    <div
                                        className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${isSelected ? 'border-primary/100' : 'border-primary/0'} rounded-br-2xl pointer-events-none transition-all duration-100 ease-in-out`}/>

                                    <div className="w-[200px] flex items-center gap-2 overflow-hidden">
                                        <User size={16}/>
                                        <span className="truncate" title={user.username}>{user.username}</span>
                                    </div>

                                    <div className="w-[250px] flex items-center overflow-hidden">
                                        <span className="truncate" title={user.email}>{user.email}</span>
                                    </div>

                                    <div className="w-[80px] flex justify-center items-center">
                                        <div
                                            className={`p-1 rounded-full ${user.isDomestic ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            {user.isDomestic ? <Home size={14}/> : <Globe size={14}/>}
                                        </div>
                                    </div>

                                    <div className="w-[80px] flex justify-center items-center">
                                        <div
                                            className={`p-1 rounded-full ${user.isAdmin === 'true' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                                            {user.isAdmin === 'true' ? <Shield size={14}/> : <User size={14}/>}
                                        </div>
                                    </div>

                                    <div className="w-[100px] flex justify-center items-center">
                                        <span className="text-sm">
                                          {user.lastConfirm ? timeAgo(user.lastConfirm) : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div id="userArea"
                     className="bg-primary text-secondary w-[400px] p-3 flex flex-col gap-3 rounded-2xl h-fit">
                    {selectedUser ? (
                        <>
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <User size={20}/>
                                User Details
                            </div>
                            <div className="w-full bg-secondary rounded-xl h-1"/>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm opacity-70">Username</div>
                                    <div className="break-words ">{selectedUser.username}</div>
                                </div>

                                <div>
                                    <div className="text-sm opacity-70">Email</div>
                                    <div className="break-words">{selectedUser.email}</div>
                                </div>

                                <div>
                                    <div className="text-sm opacity-70">User ID</div>
                                    <div className="break-words text-sm">{selectedUser.uid}</div>
                                </div>

                                <div className="flex gap-4">
                                    <div>
                                        <div className="text-sm opacity-70">Account Type</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedUser.isDomestic ? (
                                                <>
                                                    <Home size={16}/>
                                                    <span>Domestic</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Globe size={16}/>
                                                    <span>International</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={'rounded-xl px-3 bg-secondary/0 hover:bg-secondary/100 ease-in-out duration-300 transition-all text-secondary hover:text-primary cursor-pointer '}
                                        onClick={async () => {
                                            console.log(selectedUser.uid, selectedUser.isAdmin)
                                            await fetchBoth(`/api/toggleIsAdmin?uid=${selectedUser.uid}&admin=${selectedUser.isAdmin}`)
                                        }}
                                    >
                                        <div className="text-sm opacity-70">Role</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedUser.isAdmin === 'true' ? (
                                                <>
                                                    <Shield size={16}/>
                                                    <span>Admin</span>
                                                </>
                                            ) : (
                                                <>
                                                    <User size={16}/>
                                                    <span>User</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm opacity-70">Last Confirmation</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar size={16}/>
                                        {selectedUser.lastConfirm ? (
                                            <div>
                                                <div>{new Date(selectedUser.lastConfirm).toLocaleDateString()}</div>
                                                <div
                                                    className="text-sm opacity-70">{timeAgo(selectedUser.lastConfirm)}</div>
                                            </div>
                                        ) : (
                                            <span className="opacity-70">Never confirmed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 opacity-70">
                            <User size={48} className="mx-auto mb-3 opacity-50"/>
                            <p>Select a user to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}