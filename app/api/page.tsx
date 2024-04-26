import { getSession } from "@/actions"

const apiInfo = async()=>{
    const session = await getSession();
    return(
        <main className="flex min-h-screen flex-col items-center"> 
            
            <p>hello {session.username ? session.username : 'traveler'}! welcome to the API information page</p>
            <p>url/api/getperiodinf: gives you the json for your previous payperiod</p>
            <p>{!session.isLoggedIn ? 'you are not currently logged in, many of these functions will not work' : ''}</p>
        </main> 
    )
}

export default apiInfo;