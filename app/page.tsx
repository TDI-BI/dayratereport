"use client"; // this is a client componnent (?) idk why i just need this to run things
import Link from "next/link";
import { useEffect, useState } from "react";

function getWeek(){ // i will be honest i found this function online
  const today=new Date();
  const curWeek=[];

  const sundayDate = new Date(today); // this gets us last sunday
  sundayDate.setDate(today.getDate() - today.getDay());

  for (let i = 1; i < 15; i++) { // this pulls us the rest of the week
    const nextDay = new Date(sundayDate);
    nextDay.setDate(sundayDate.getDate() + i);
    curWeek.push(new Date(nextDay));  
  }
  return curWeek;
}



export default function Home() {
  let week= getWeek();

  const [dataResponse, setdataResponse] = useState([]);
  useEffect(() => {
    async function getPageData(){
      const apiUrlEndpoint = 'http://localhost:3000/api/hello'
      const response = await fetch(apiUrlEndpoint);
      const res = await response.json();
      console.log(res.resp);// -> desnt work idk why
      setdataResponse(res.resp);
    }
    getPageData();
  }, []);


  return (

    <main className="flex min-h-screen flex-col items-center">  
      <div>
      {/* // throws crazy errors but its a working example of pulling from the server at least
        dataResponse.map((items) => <div> {items.msg} </div>)
      */}
      </div>

      <div>{/*for some reason i need to wrap this or the whole page is inline-flex row*/}
        <div className='tblHead'>
          <div className='tblHeadItm'>
            <strong>Date</strong>
          </div>
          <div className='tblHeadItm'>
            <strong>worked?</strong>
          </div>
          <div className='tblHeadItm'>
            <strong>Vessels</strong>  
          </div>
        </div>
      </div>
      { //this generates our week 
        week.map((day)=>
          <div className='tblBody' id={day.toISOString().substring(0, 10)+' item'}>
            <div className='tblBodyItm'>
              {
                //day.toString()
                day.toISOString().substring(0, 10)
              }
            </div>
            <div className='tblBodyItm'>
              <input type='checkbox'  id={day.toString()+'worked'/*this is probably redundant and will get cut*/}></input>
            </div>
            <div className='tblBodyItm'>
              {/*ill probably make this auto suggest at some point, or turn it into a drop down*/
              //im going to be honest this is probably best suited to just be a dbproject in like php lol
              }
              <input type='text' className='shipInput' id={day.toISOString().substring(0, 10)+' ship'}></input>
            </div>
          </div>  
        )
      }
        <div className='tblFoot'>
          <Link href='api/hello'><div className='tblFootBtn'>save</div></Link> {/*lets do a little pop-up that says saved when we click this */}
          <Link href='review'><div className='tblFootBtn'> review </div></Link>
        </div>
    </main>
  );
}
