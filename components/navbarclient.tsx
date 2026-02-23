"use client";
import Link from "next/link";
import {logout} from "@/actions";
import {useState, useEffect} from "react";
import {usePathname} from "next/navigation";
import {Menu, X} from "lucide-react";

interface NavbarProps {
  loggedin: boolean;
}

const NavbarCl = ({loggedin}: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const amIAdmin = async () => {
      try {
        const amIAdminInf = await fetch('/api/account/myAccountInfo?fields=isAdmin')
        const thisGuy = await amIAdminInf.json();
        if (thisGuy.resp.isAdmin) setAdmin(true);
      } catch (e) {

      }
    }
    amIAdmin();
  }, []);

  if (!loggedin)
    return <div className="h-[50px]" data-testid="logout padding"/>;

  return (
    <div>
      {/* ── MOBILE (hidden at sm+) ── */}
      <div className="sm:hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 h-[62px]">
          {/* Menu button island */}
          <div
            className="bg-tdi-blue shadow p-2 cursor-pointer flex items-center justify-center w-[38px] h-[38px] relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={`absolute transition-all duration-300 ease-in-out ${
              isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
            }`}>
              <Menu size={22} className="text-secondary"/>
            </div>
            <div className={`absolute transition-all duration-300 ease-in-out ${
              isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
            }`}>
              <X size={22} className="text-secondary"/>
            </div>
          </div>

          {/* Logo island */}
          <div
            className="bg-tdi-blue shadow px-4 py-2 h-[36px] w-[106px] flex items-center justify-center overflow-hidden">
            <img
              src="https://www.tdi-bi.com/wp-content/uploads/2025/05/footer-logo.png"
              alt="TDI Logo"
              height={22}
              width={75}
              className="w-full h-auto max-h-[22px] object-contain"
            />
          </div>
        </div>

        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-primary/60 transition-all duration-300 ease-in-out z-[30] ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile menu */}
        <div
          className={`fixed top-[62px] left-4 right-4 z-[75] bg-tdi-blue shadow transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}>
          <Link
            href="/daysworked"
            onClick={() => setIsOpen(false)}
            className="group flex flex-col px-5 py-4 border-b border-secondary/20"
          >
            <span
              className={`text-sm font-semibold uppercase tracking-tight select-none transition-colors duration-200 ${
                isActive("/daysworked") ? "text-secondary" : "text-secondary/60 group-hover:text-secondary"
              }`}>
              Days Worked
            </span>
            <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out mt-1 ${
              isActive("/daysworked") ? "w-full" : "w-0 group-hover:w-full"
            }`}/>
          </Link>

          <Link
            href="/info"
            onClick={() => setIsOpen(false)}
            className="group flex flex-col px-5 py-4 border-b border-secondary/20"
          >
            <span
              className={`text-sm font-semibold uppercase tracking-tight select-none transition-colors duration-200 ${
                isActive("/info") ? "text-secondary" : "text-secondary/60 group-hover:text-secondary"
              }`}>
              Info
            </span>
            <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out mt-1 ${
              isActive("/info") ? "w-full" : "w-0 group-hover:w-full"
            }`}/>
          </Link>

          <form action={logout} onClick={() => setIsOpen(false)}>
            <button className="group flex flex-col w-full px-5 py-4 text-left">
              <span
                className="text-sm font-semibold uppercase tracking-tight text-secondary/60 group-hover:text-secondary select-none transition-colors duration-200">
                Logout
              </span>
              <div
                className="h-[2px] bg-secondary w-0 group-hover:w-full transition-all duration-300 ease-in-out mt-1"/>
            </button>
          </form>
        </div>
      </div>

      {/* ── DESKTOP (hidden below sm) ── */}
      <nav className="hidden sm:flex items-center justify-between px-6 py-4">
        {/* Logo island */}
        <div className="bg-tdi-blue shadow px-5 py-3 max-w-[160px]">
          <img
            src="https://www.tdi-bi.com/wp-content/uploads/2025/05/footer-logo.png"
            alt="TDI Logo"
            className="w-full h-auto max-h-[28px] object-contain"
          />
        </div>

        {/* Links island */}
        <div className="bg-tdi-blue shadow flex items-center">
          <Link href="/daysworked" className="group px-6 py-3 flex flex-col items-center">
            <span className="text-secondary text-sm font-semibold uppercase tracking-tight select-none">
              Days Worked
            </span>
            <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out ${
              isActive("/daysworked") ? "w-full" : "w-0 group-hover:w-full"
            }`}/>
          </Link>
          <div className="w-[2px] h-[20px] bg-secondary/20"/>
          <Link href="/info" className="group px-6 py-3 flex flex-col items-center">
            <span className="text-secondary text-sm font-semibold uppercase tracking-tight select-none">
              Info
            </span>
            <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out ${
              isActive("/info") ? "w-full" : "w-0 group-hover:w-full"
            }`}/>
          </Link>
          <div className="w-[2px] h-[20px] bg-secondary/20"/>
          {admin ? (<>
            <div className="w-[2px] h-[20px] bg-secondary/20"/>
            <Link href="/admin" className="group px-6 py-3 flex flex-col items-center">
            <span className="text-secondary text-sm font-semibold uppercase tracking-tight select-none">
              Periods
            </span>
              <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out ${
                isActive("/admin") ? "w-full" : "w-0 group-hover:w-full"
              }`}/>
            </Link>
            <div className="w-[2px] h-[20px] bg-secondary/20"/>
            <Link href="/admin/users" className="group px-6 py-3 flex flex-col items-center">
            <span className="text-secondary text-sm font-semibold uppercase tracking-tight select-none">
              Users
            </span>
              <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out ${
                isActive("/admin/users") ? "w-full" : "w-0 group-hover:w-full"
              }`}/>
            </Link>
            <div className="w-[2px] h-[20px] bg-secondary/20"/>
            <Link href="/admin/emails" className="group px-6 py-3 flex flex-col items-center">
            <span className="text-secondary text-sm font-semibold uppercase tracking-tight select-none">
              Emails
            </span>
              <div className={`h-[2px] bg-secondary transition-all duration-300 ease-in-out ${
                isActive("/admin/emails") ? "w-full" : "w-0 group-hover:w-full"
              }`}/>
            </Link></>) : ''}
          <form action={logout}>
            <button className="group px-6 py-3 flex flex-col items-center">
              <span className="text-secondary text-sm font-semibold uppercase tracking-tight select-none">
                Logout
              </span>
              <div className="w-0 group-hover:w-full h-[2px] bg-secondary transition-all duration-300 ease-in-out"/>
            </button>
          </form>

        </div>
      </nav>
    </div>
  );
};

export default NavbarCl;