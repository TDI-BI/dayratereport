"use client";
import {useState, useEffect} from "react";
import {Mail, MoveLeft, MoveRight, Search} from "lucide-react";
import {AdminNav} from "@/components/adminNav";
import {fetchBoth} from "@/utils/fetchboth";

const timeAgo = (isoDate: string) => {
    const now = new Date();
    const then = new Date(isoDate);
    const diffMs = now.getTime() - then.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
    if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
    return `${years} year${years !== 1 ? "s" : ""} ago`;
}


const ViewEmails = () => {
    const [filter, setFilter] = useState('');
    const [emails, setEmails] = useState<Array<Record<string, string>>>([]);
    const [page, setPage] = useState<number>(1);
    const [emailId, setEmailId] = useState<string>('');
    const ourEmail = emails.filter((email) => email.id === emailId)[0] ?? {};

    console.log(emailId);

    useEffect(() => {
        const getEmails = async () => {
            const resp = await fetchBoth(`/api/getemails?user=${filter}&page=${page}&status=${0}`);
            const json = await resp.json();
            const inemails = json.emails ?? {}
            setEmails(inemails.sort((a: Record<string, string>, b: Record<string, string>) => a.id < b.id)); // descend
        };
        getEmails();
    }, [filter, page])

    return (
        <main className="flex min-h-screen flex-col items-center">
            <AdminNav/>
            <div className={'h-5'}/>
            <div className={'flex gap-5'}>
                <div id={'table'} className={'w-[700px] p-3'}>
                    <div id={'header'} className={'flex flex-row justify-between pb-1'}>
                        <div
                            className="flex justify-center gap-[10px] group/search bg-primary/0 hover:bg-primary/100 text-inherit hover:text-secondary transition-all ease-in-out duration-300 rounded-lg py-[10px] px-[10px]">
                            <Search/>
                            <div onClick={(e) => e.stopPropagation()}>
                                <input
                                    className="text-inherit bg-inherit focus:outline-none peer"
                                    type="text"
                                    placeholder="search users..."
                                    value={filter}
                                    onChange={(e) => {
                                        setPage(1);
                                        setFilter(e.target.value);
                                    }}
                                />
                                <div
                                    className={`rounded-md w-[0%] peer-focus:w-[100%] group-hover/search:w-[100%] h-[3px] bg-secondary group-hover:bg/primary group-hover/search:bg-secondary transition-all ease-in-out duration-300 delay-100`}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="group flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] py-[10px] h-[44px] px-5 rounded-md text-primary bg-primary/0 hover:bg-primary/100 hover:text-secondary"
                                onClick={async () => {
                                    if (page === 1) return;
                                    setPage(page - 1);
                                }}
                            >
                                <MoveLeft size={24} className="flex-shrink-0"/>
                                <p className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-inherit">
                                    last page
                                </p>
                            </button>

                            <button
                                className="group flex flex-row-reverse items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden max-w-[50px] hover:max-w-[150px] py-[10px] h-[44px] px-5 rounded-md text-primary bg-primary/0 hover:bg-primary/100 hover:text-secondary"
                                onClick={async () => {
                                    if (emails.length === 0) return;
                                    setPage(page + 1);
                                }}
                            >
                                <MoveRight size={24} className="flex-shrink-0"/>
                                <p className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                                    next page
                                </p>
                            </button>
                        </div>
                    </div>
                    <div className={'w-full bg-primary rounded-xl h-1'}/>
                    <div className={'flex flex-col gap-1 pt-1'} id={'emails'}>
                        {emails.map((e) => {
                            const err = e.status.split(':')[0] === 'Failure';
                            const isSelected = emailId === e.id;

                            return <div
                                className={'flex flex-row justify-between align-middle p-1 rounded-xl bg-primary/0 hover:bg-primary/100 hover:text-secondary cursor-pointer duration-300 ease-in-out transition-all relative'}
                                key={`email_${e.id}`}
                                onClick={() => {
                                    if (e.id === emailId) setEmailId('');
                                    else setEmailId(e.id);
                                }}
                            >
                                <div
                                    className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${isSelected ? 'border-primary/100' : 'border-primary/0'} rounded-tl-2xl pointer-events-none transition-all duration-100 ease-in-out`}/>
                                <div
                                    className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${isSelected ? 'border-primary/100' : 'border-primary/0'} rounded-br-2xl pointer-events-none transition-all duration-100 ease-in-out`}/>

                                <div className={`p-2 ${err ? 'bg-red-500' : 'bg-green-500'} rounded-xl flex gap-1`}>
                                    <Mail/>
                                    <p>{err ? 'Failure' : 'Success'}</p>
                                </div>
                                <div
                                    className="h-[40px] px-3 flex items-center overflow-hidden whitespace-nowrap text-ellipsis"
                                    title={e.sentTo}
                                >{e.sentTo}</div>
                                <div
                                    className="h-[40px] px-3 flex items-center w-[150px] justify-center"
                                >{timeAgo(e.date)}</div>
                            </div>
                        })}
                    </div>
                </div>
                <div id={'emailArea'}
                     className={'bg-primary text-secondary w-[500px] p-3 flex flex-col gap-1 rounded-2xl h-fit'}>
                    {emailId !== '' ? <>
                        <div className="break-words">To: {ourEmail.sentTo}</div>
                        <div className="break-words">Subject: {ourEmail.subject}</div>
                        <div className="break-words">Dispatch Status: {ourEmail.status}</div>
                        <div className={'w-full bg-secondary rounded-xl h-1'}/>
                        <div className="break-words overflow-hidden">
                            <div dangerouslySetInnerHTML={{__html: ourEmail.body}}/>
                        </div>
                    </> : <>
                        <div className="text-center py-8 opacity-70">
                            <Mail size={48} className="mx-auto mb-3 opacity-50"/>
                            <p>Select an email to view details</p>
                        </div>
                    </>}
                </div>
            </div>
        </main>
    )
}
export default ViewEmails;