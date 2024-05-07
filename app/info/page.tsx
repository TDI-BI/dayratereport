
import { getSession, changeUsername} from '@/actions'
import { redirect } from 'next/navigation';

const profile = async () => {
    const session = await getSession();
    if(!session.isLoggedIn){
        redirect('/login')
    }
    let name = session.userId!.split('/')
    return(
        <main className="flex min-h-screen flex-col items-center"> 
                <div id="bweh">
                    <p> username: {session.username}</p>
                    <p> email: {session.userEmail} </p>
                    <p> username: {name[0] + " " + name[1]} </p>
                </div>
                <p> <strong> INSTRUCTIONS </strong> </p>
                <p>fill out your travel log just as you would with the old spreadsheet</p>
                <p> when you are done make sure to click save or use ctrl + s </p>
                <p> saved information will be greyed in </p>
                <p> if you want to unfill a feild just untick the worked box and save your log </p>
                <p> when you are ready click review</p>
                <p> make sure that the information is all correct then click submit when ready</p>
                <p> this will download a pdf of your travel log locally and automatically email said pdf to HR </p>
        </main>
    ) 
}

export default profile;