export const getPeriod = () =>{ // found this online
    //for now it just gets the last week and next. at some point
    //i will have to fix this fraud function and make it work better so it can actually load stuff
    const today=new Date();
    const curPeriod=[];
  
    const sundayDate = new Date(today); // this gets us last sunday
    sundayDate.setDate(today.getDate() - today.getDay());
  
    for (let i = 1; i <= 7  ; i++) { // this pulls us the rest of the payperiod
      const nextDay = new Date(sundayDate);
      nextDay.setDate(sundayDate.getDate() + i);
      curPeriod.push(new Date(nextDay).toISOString().substring(0, 10));  
    }
    return curPeriod;
  }