// returns the current payperiod as YYYY-MM-DD isostrings


/* utc version - useless and stupid and i hate it
export const getPeriod = (input=0) =>{ // found this online
    //for now it just gets the last week and next. at some point
    //solution for last monday: https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
    let dateCh = new Date(new Date().toLocaleDateString('en-US', {timeZone: 'America/Chicago'})) // chicago date
    const date = new Date(Date.UTC(dateCh.getFullYear(), dateCh.getMonth(), dateCh.getDate())) // to UTC
    let cguy=input*-7; // -7, 0, 7 for back reg forward
    //date.setDate(date.getDate() - date.getDay() - 6 + cguy )
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay()===1 ? 7 : (date.getUTCDay() + 6)%7) - cguy))
    const curPeriod=[date.toISOString().split('T')[0]];
    console.log(date.toISOString().split('T')[0])
    for (let i = 0; i < 6  ; i++) { // this pulls us the rest of the payperiod
        const nextDay = new Date(date);
        console.log(i)
        nextDay.setDate(date.getUTCDate() + i);
        curPeriod.push(nextDay.toISOString().split('T')[0]);  
    }
    return curPeriod;
}
*/

//legacy version, hopefully fine still :)
export const getPeriod = (input=0) =>{ // found this online
    //for now it just gets the last week and next. at some point
    //extremely fraudulent function but probably makes nice w/ server still :p
    const curPeriod=[];

    //solution for last monday: https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
    let date = new Date(new Date().toLocaleDateString('en-US', {timeZone: 'America/Chicago'}))
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
