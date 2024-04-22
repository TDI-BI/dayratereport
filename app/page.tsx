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
  return (

    <main className="flex min-h-screen flex-col items-center">

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

        {
        week.map((day)=>
          <div className='tblBody' id={day.toString()+' item'}>
            <div className='tblBodyItm'>
              {
                //day.toString()
                day.getMonth().toString()+'/'+day.getDate().toString()+'/'+day.getFullYear().toString()
              }
            </div>
            <div className='tblBodyItm'>
              <input type='checkbox' id={day.toString()+'worked'/*this is probably redundant and will get cut*/}></input>
            </div>
            <div className='tblBodyItm'>
              {/*ill probably make this auto suggest at some point, or turn it into a drop down*/}
              <input type='text' className='shipInput' id={day.toString()+'ship'}></input>
            </div>
          </div>  
        )
        }
        <div className='tblFoot'>
          <div className='tblFootBtn'> save </div> {/*lets do a little pop-up that says saved when we click this */}
          <div className='tblFootBtn'> submit </div>
        </div>

    </main>
  );
}
