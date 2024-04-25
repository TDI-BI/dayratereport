import {logout} from '@/actions'
const LogoutForm = () =>{
    return(
        <form action={logout}>
            <button className='headBtn'>
                logout
            </button>
        </form>
    )
}

export default LogoutForm;