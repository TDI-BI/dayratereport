"use client";
import Link from "next/link";
import { logout } from "@/actions";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react"; // slowly replacing the icon pack

interface btnProps {
    text: string;
    select?: boolean;
    delay?: string;
    opn?: boolean
}

const Navbtn = (props: btnProps) => {
    return (
        <div className="group">
            <button className="w-[200px] text-center rounded-xl py-[10px]">
                <p>{props.text}</p>
            </button>
            <div className="w-[0%] group-hover:w-[100%] transition-all duration-300 ease-in-out bg-white h-[2px]" />
        </div>
    );
};

const MNavbtn = (props: btnProps) => {
    return (
        <div 
            className={`transition-all duration-300 ease-in-out ${
                props.opn
                    ? "opacity-100 "
                    : "opacity-0 pointer-events-none"
                }`}
                style={{transitionDelay:props.opn ? `${props.delay}ms` : '0ms'}}     
        >
            <div className="group">
                <button className="w-[300px] h-[70px] text-center rounded-xl py-[10px]">
                    <p>{props.text}</p>
                </button>
                <div className="w-[0%] group-hover:w-[100%] transition-all duration-300 ease-in-out bg-white h-[2px]" />
            </div>
        </div>
    );
};

interface navbr {
    loggedin: boolean;
}

const NavbarCl = (navprops: navbr) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkWidth = () => {
            setIsMobile(window.innerWidth < 650);
            if (window.innerWidth >= 650) setIsOpen(false);
        };
        const handleScroll = () => {
            // maybe we skip
            setIsOpen(false);
        };

        checkWidth();
        window.addEventListener("resize", checkWidth);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("resize", checkWidth);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    if (!navprops.loggedin)
        return <div className="h-[50px]" data-testid="logout padding" />;
    return (
        <div>
            {isMobile ? (
                <div>
                    <div className="h-[46px] p-[3px] z-[100] relative isolation">
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
                        >
                            <div
                                className={`absolute transition-all duration-300 ease-in-out ${
                                    isOpen
                                        ? "opacity-0 rotate-90 transform scale-0"
                                        : "opacity-100 rotate-0 trasnform scale-100"
                                }`}
                            >
                                {" "}
                                <Menu size={36} />{" "}
                            </div>
                            <div
                                className={`absolute transition-all duration-300 ease-in-out ${
                                    isOpen
                                        ? "opacity-100 rotate-0 transform scale-100"
                                        : "opacity-0 -rotate-90 transform scale-0"
                                }`}
                            >
                                {" "}
                                <X size={36} />{" "}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`fixed inset-0 bg-black/30 backdrop-blur-md transition-all duration-300 ease-in-out z-[30] ${
                            isOpen
                                ? "opacity-100"
                                : "opacity-0 pointer-events-none"
                        }`}
                    />
                    <div className={`fixed top-[46px] left-0 right-0 flex flex-col items-center pt-4 z-[75] ${isOpen ? '' : 'pointer-events-none'}`}>
                            <form action={logout} className="group" onClick={()=>setIsOpen(false)}>
                                <MNavbtn text={"logout"} opn={isOpen} delay='100' />
                            </form>
                            <Link href="/daysworked" onClick={()=>setIsOpen(false)}>
                                <MNavbtn text={"Days Worked"} opn={isOpen} delay='200'/>
                            </Link>
                            <Link href="/info" onClick={()=>setIsOpen(false)}>
                                <MNavbtn text={"info"} opn={isOpen} delay='300'/>
                            </Link>
                    </div>
                </div>
            ) : (
                <nav className="flex gap-5 items-center justify-center">
                    <form action={logout} className="group">
                        <Navbtn text={"logout"} />
                    </form>
                    <Link href="/daysworked">
                        <Navbtn text={"Days Worked"} />
                    </Link>
                    <Link href="/info">
                        <Navbtn text={"info"} />
                    </Link>
                </nav>
            )}
        </div>
    );
};

export default NavbarCl;
