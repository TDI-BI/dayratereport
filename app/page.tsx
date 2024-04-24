"use client"; // needed for interactivity
import Link from "next/link";

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

  function save(){
    //probably loop through the dates, build our query, send our query, go next?
    week.forEach((day)=>{

      let cday=day.toISOString().substring(0, 10);
      let cship=document.getElementById(cday+'_ship').value;
      //console.log(cday);
      if(cship) console.log(cday + ': ' +cship);

      const postData ={
        method:   'Post',
        body: JSON.stringify({
          uid:1,
          day:cday,
          ship:cship,
        })
      }

    
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center">  

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
      { //this generates our week 
        week.map((day)=> // we get an error here because this list lacks keys but i dont think it really matters tbg lol
          <div className='tblBody' id={day.toISOString().substring(0, 10)+' item'}>
            <div className='tblBodyItm'>
              {
                //day.toString()
                day.toISOString().substring(0, 10)
              }
            </div>
            <div className='tblBodyItm'>
              {/*ill probably make this auto suggest at some point, or turn it into a drop down*/
              //im going to be honest this is probably best suited to just be a dbproject in like php lol
              }
              <input type='text' className='shipInput' id={day.toISOString().substring(0, 10)+'_ship'}></input>
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
