"use client"; // needed for interactivity
import Link from "next/link";
import { useState, useEffect } from "react";
import { getPeriod } from '@/utils/payperiod';
import { getPort } from '@/utils/getPort';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell
} from "@nextui-org/react"
let por=getPort();

//need to make this async and password protect it at some point
export default function Home(){ // we might want to find a way to protect this ig

  //we are just gonna hard set this for right now but eventually maybe we should query to autofill it
  //should just be a list of our facilities or whatever
  const slist:string[] = [
    'brooks',
    'emma',
    'marcelle',
    'proteus',
    'gyre',
    'nautilus',
    'barnacle',
    'unspecified',
  ]

  let period= getPeriod();

  //this and save are a package deal. these update our database with the currently filled in values!
  useState([]); // we dont really care for a response here so were just running it blind
  const saveDay = async (info:string) =>{ // got this from a tutorial, not really fully sure how this works
    const apiUrlEndpoint ='http://'+por+'/api/mkday'+info;
    const response = await fetch(apiUrlEndpoint);
    //const res = await response.json(); //-> at some point our return will be a success message with a popup
    //setdataResponse(res.resp); // but for now we arent returning anything but an error so we just ignore our output
  }
  function save(){ 
    // idk if theres a painless way to make the errors here go away. 
    //doesnt interfere with run or run time so i think i just ignore
    period.forEach((day)=>{
      let cday=day;
      let cship= (document.getElementById(cday+'_ship') as HTMLInputElement).value.substring(0, 15) || ''; // trim to prevent overflow
      if(cship=='') cship = (document.getElementById(cday+'_ship')!.getAttribute('placeholder') as string);
      if(
        cship=='' && 
        (document.getElementById(cday+'_worked') as HTMLInputElement).checked
      ) cship='unspecified';
      if(
        document.getElementById(cday+'_ship')!.getAttribute('placeholder') && 
        !(document.getElementById(cday+'_worked')! as HTMLInputElement).checked
      ) cship=''
      
      if(cship=='none')cship='';

      //update our table
      (document.getElementById(cday+'_ship') as HTMLInputElement).value='';
      document.getElementById(cday+'_ship')!.setAttribute('placeholder', cship);
      cship ? (document.getElementById(cday+'_worked') as HTMLInputElement).checked = true : (document.getElementById(cday+'_worked') as HTMLInputElement).checked = false;
      //build our query!
      saveDay('?uid='+'none'+'&day='+cday+'&ship='+cship);
    })
  }
  //end package deal

  //construct travellog
  const [dataResponse, setdataResponse] = useState([]);
    useEffect(() => {
      async function getPeriodInf(){
        const apiUrlEndpoint = 'http://'+por+'/api/getperiodinf';
        console.log(apiUrlEndpoint)
        const response = await fetch(apiUrlEndpoint);
        const res = await response.json();
        setdataResponse(res.resp); 
      }
      getPeriodInf();

      //not a part of the query, but just needs to be wrapped in a useeffect
      document.addEventListener('keydown', e => { // catch ctrls
        if (e.ctrlKey && e.key === 's') {
          // Prevent the Save dialog to open
          e.preventDefault();
          save();
        }
      });
    }, []);
    //now lets make our dict that is day -> ship

  var dict: {[id: string] : string} = {};
  dataResponse.forEach((item) => { // should build our dictionary mybe
    dict[item['day']]=item['ship']
    if(item['ship']) (document.getElementById(item['day']+'_worked') as HTMLInputElement).checked = true;
  }) 


  //end travellog
  return (
    <main className="flex min-h-screen flex-col items-center px-1">  

        <datalist id='suggestion'>
            {slist.map((item) => <option key={item} value={item}>{item}</option>)}
        </datalist>

        <Table>
            <TableHeader>
                <TableColumn className='tblHeadItmCheck'>
                    <input type='checkbox' id={'all'} />
                </TableColumn>
                <TableColumn className='tblHeadItm'>
                    DATE
                </TableColumn>
                <TableColumn className='tblHeadItm'>
                    VESSEL
                </TableColumn>
            </TableHeader>
            <TableBody>
                {
                period.map((day:string)=> // we get an error here because this list lacks keys but i dont think it really matters tbg lol
                    <TableRow key={day} id={day+' item'}>
                        <TableCell className="tblBodyItmCheck">
                            <input type='checkbox' id={day+'_worked'}/>
                        </TableCell>
                        <TableCell className="tblBodyItm">
                            {day}
                        </TableCell>
                        <TableCell className="tblBodyItm">
                            <input type='text' className='shipInput' id={day+'_ship'} placeholder={dict[day] ? dict[day] : ''} list='suggestion'/>
                        </TableCell>
                    </TableRow>  
                )}
            </TableBody>
        </Table>

        <div className='tblFoot'>
            <button className='tblFootBtn' onClick={save}>save</button> {/*lets do a little pop-up that says saved when we click this */}
            <Link href='travellog/review'><div className='tblFootBtn'> review </div></Link>
        </div>
    </main>
  );
}
