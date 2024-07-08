export const getPeriod = (input=0) =>{ // found this online
    //for now it just gets the last week and next. at some point
    //i will have to fix this fraud function and make it work better so it can actually load stuff
    const today=new Date();
    const curPeriod=[];

    //solution for last monday: https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
    let date = new Date()
    let cguy=input*-7; // -7, 0, 7 for back reg forward
    //date.setDate(date.getDate() - date.getDay() - 6 + cguy )
    date.setDate(date.getDate() - ((date.getDay()==1 ? 7 : (date.getDay() + 6)%7) - cguy))
  
    for (let i = 0; i <= 6  ; i++) { // this pulls us the rest of the payperiod
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + i);
      curPeriod.push(new Date(nextDay).toISOString().substring(0, 10));  
    }
    return curPeriod;
  }