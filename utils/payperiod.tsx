// returns the current payperiod as [YYYY-MM-DD]

// if you are calling this somewhere in a client script you will have to associate it with the 'verifydate' api script
// js date relys on client information and returns faulty data if the user's timeozone or clock is mis-set
// this is not compatible with the admin pages I wrote but those are only ever called from the office on a pc anyway so i dont forsee actual issues occuring there
export const getPeriod = (input = 0) => {
    // found this online
    //for now it just gets the last week and next. at some point
    //extremely fraudulent function but probably makes nice w/ server still :p
    const curPeriod = [];

    let date = new Date(
        new Date().toLocaleDateString("en-US", {timeZone: "America/Chicago"})
    );
    let cguy = input * -7; // converts from weeks to days
    date.setDate(
        date.getDate() -
        ((date.getDay() == 1 ? 7 : (date.getDay() + 6) % 7) - cguy)
    );

    for (let i = 0; i <= 6; i++) {
        // this pulls us the rest of the payperiod
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + i);
        curPeriod.push(new Date(nextDay).toISOString().substring(0, 10));
    }
    return curPeriod;
};
