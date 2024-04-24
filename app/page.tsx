"use client"; // needed for interactivity
import Link from "next/link";
import { useState } from "react";


function getPeriod(){ // i will be honest i found this function online
  const today=new Date();
  const curPeriod=[];

  const sundayDate = new Date(today); // this gets us last sunday
  sundayDate.setDate(today.getDate() - today.getDay());

  for (let i = 1; i < 15; i++) { // this pulls us the rest of the payperiod
    const nextDay = new Date(sundayDate);
    nextDay.setDate(sundayDate.getDate() + i);
    curPeriod.push(new Date(nextDay).toISOString().substring(0, 10));  
  }
  return curPeriod;
}





export default function Home() {
  let period= getPeriod();



  //this and save are a package deal. these update our database with the currently filled in values!
  const [dataResponse, setdataResponse] = useState([]);
  const saveDay = async (info:string) =>{ // got this from a tutorial, not really fully sure how this works
    const apiUrlEndpoint = 'http://localhost:3000/api/mkday'+info;
    const response = await fetch(apiUrlEndpoint);
    //const res = await response.json(); //-> at some point our return will be a success message with a popup
    //setdataResponse(res.resp); // but for now we arent returning anything but an error so we just ignore our output
  }
  function save(){
    //probably loop through the dates, build our query, send our query, go next?
    period.forEach((day)=>{
      let cday=day;
      let cship=document.getElementById(cday+'_ship').value; // literally fraudulent error, maybe something wrong with my editors config
      //console.log(cday);
      if(cship){ 
        console.log(cday + ': ' +cship);
        //build our query!
        saveDay('?uid='+'none'+'&day='+cday+'&ship='+cship);
      }
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center">  
      <div>{ // throws crazy errors but its a working example of pulling from the server at least
        //dataResponse.map((items) => <div> {items.msg} </div>)
      }</div>



      <div>{/*for some reason i need to wrap this or the whole page is inline-flex row*/}
        <div className='tblHead'>
          <div className='tblHeadItm'>
            <strong>Date</strong>
          </div>
          <div className='tblHeadItm'>
            <strong>Vessels</strong>  
          </div>
        </div>
      </div>
      { //this generates our payperiod table 
        period.map((day)=> // we get an error here because this list lacks keys but i dont think it really matters tbg lol
          <div className='tblBody' id={day+' item'}>
            <div className='tblBodyItm'>
              {
                //day.toString()
                day
              }
            </div>
            <div className='tblBodyItm'>
              {/*ill probably make this auto suggest at some point, or turn it into a drop down*/
              //im going to be honest this is probably best suited to just be a dbproject in like php lol
              }
              <input type='text' className='shipInput' id={day+'_ship'}></input>
            </div>
          </div>  
        )
      }
        <div className='tblFoot'>
          <div className='tblFootBtn' onClick={save}>save</div> {/*lets do a little pop-up that says saved when we click this */}
          <Link href='review'><div className='tblFootBtn'> review </div></Link>
        </div>
    </main>
  );
}
