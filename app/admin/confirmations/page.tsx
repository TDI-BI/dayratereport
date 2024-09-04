'use client'
import { getPort } from "@/utils/getPort"; const por = getPort();
import { fetchBoth } from "@/utils/fetchBoth";
import { getPeriod } from "@/utils/payperiod";
import { 
    useState, 
    useEffect 
} from "react";

const Confirmations = () =>{
    const period = getPeriod();

    //states
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('UID'); // currently unused
    const [users, setUsers] = useState([]);

    //filters
    const searchFilter = (array:any) => {
        return array.filter(
            (el:any)=>el['uid'].includes(search)
        );
    }
    const sortBy = (array:any)=>{
        return array.sort(
            (el1:any, el2:any)=>{
                if(el1[sort]==el2[sort]) return 0;
                else return el1[sort]>el2[sort] ? 1 : -1;
            }
        );
    }
    
    //database queries
    useEffect(()=>{
        const getArr = async () =>{
            //fetch from database
            let resp = await fetchBoth(por+'/api/getusers');
            const users = (await resp.json()).resp;

            //set states
            setUsers(users);
        }
        getArr();

    }, [])

    //deploy filters
    const filtered = searchFilter(users);
    const sorted = sortBy(filtered);

    return(
        <main className="flex min-h-screen flex-col items-center">
            <input type='text' onChange={(e)=>{
                setSearch(e.target.value)
            }}/>
            <div className='adminTable'>
                <div className='adminRow'>
                        <div className='adminCell adminLabelX' key='uidlabel'><strong>UID</strong></div>
                        <div className='adminCell adminLabelX' key='emaillabel'><strong>EMAIL</strong></div>
                        <div className='adminCell' key='conflabel'>confirmed:</div>
                    </div>
                 
                {sorted.map((inp:any)=>
                    <div className='adminRow' key={inp['uid'] + 'row'}>
                        <div className='adminCell adminLabelX' key={inp['uid']+'uid'}>{inp['uid']} </div>
                        <div className='adminCell adminLabelX' key={inp['uid']+'email'}>{inp['email']} </div>
                        <div className={(period.includes(inp['lastConfirm']) && inp['lastConfirm']) ? 'adminCell adminCellG' : 'adminCell adminCellR'} key={inp['uid']+'confirmation'}>{inp['lastConfirm']} </div>
                    </div>
                )}
            </div>
        </main>
    )
}

export default Confirmations;