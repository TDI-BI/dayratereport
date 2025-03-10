import NavbarCl from "./navbarclient";
import { getSession } from "@/actions";

const Navbar = async ()=>{
    const sesh = await getSession();
    return (
        <NavbarCl loggedin={Boolean(sesh.isLoggedIn)}/>
    )
}

export default Navbar;