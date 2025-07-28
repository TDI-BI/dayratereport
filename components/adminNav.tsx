import Link from "next/link";
import {Navbtn} from "@/components/navbarclient";

export const AdminNav = () => {
    return <nav className="flex gap-5 items-center justify-center" key={'adminNav'}>
        <Link href={"/admin"} key={1}>
            <Navbtn text={'admin home'}/>
        </Link>
        <Link href={"/admin/emails"} key={2}>
            <Navbtn text={'emails'}/>
        </Link>
        <Link href={"/admin/users"} key={3}>
            <Navbtn text={'users'}/>
        </Link>
    </nav>
}