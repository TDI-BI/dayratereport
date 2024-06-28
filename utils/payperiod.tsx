import { getSession } from "@/actions";


export const getPeriod = async () =>{
    const session = await getSession();
    const which = session.whatPeriod || 0; // 0 is default anyway

    const today=new Date();
    const curPeriod=[];

    //solution for last monday: https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
    let target = 1 // Monday, scale 0-7
    let date = new Date()
    let cguy=-(which*7); // -7, 0, 7 for back reg forward
    date.setDate(date.getDate() - ( date.getDay() == target ? 7 : (date.getDay() + (7 - target)) % 7 ) + cguy)
    //console.log(date)
    
  
    for (let i = 0; i <= 6  ; i++) { // this pulls us the rest of the payperiod
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + i);
      curPeriod.push(new Date(nextDay).toISOString().substring(0, 10));  
    }
    return curPeriod;
}


export const getPeriodNow = () =>{ // found this online
    //for now it just gets the last week and next. at some point
    //i will have to fix this fraud function and make it work better so it can actually load stuff
    const today=new Date();
    const curPeriod=[];

    //solution for last monday: https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
    let target = 1 // Monday, scale 0-7
    let date = new Date()
    let cguy=0; // -7, 0, 7 for back reg forward
    date.setDate(date.getDate() - ( date.getDay() == target ? 7 : (date.getDay() + (7 - target)) % 7 ) + cguy)
    //console.log(date)
    
  
    for (let i = 0; i <= 6  ; i++) { // this pulls us the rest of the payperiod
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + i);
      curPeriod.push(new Date(nextDay).toISOString().substring(0, 10));  
    }
    return curPeriod;
  }