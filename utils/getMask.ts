//mode is either "month" or "week"
//add is the distance back we should tack on (ie 0=this month, 1=this month + last etc)
//ind is what point we start at (ie 0=this period, 1=last, etc)
//we leverage getPeriod to get weeks when in week mode
//this will only be called server side so in week mode we can easily use "periodstarts" from our database
import {connectToDb} from "@/utils/connectToDb";
import {getPeriod} from "@/utils/payperiod";
import mysql from "mysql2/promise";

interface PeriodRow extends mysql.RowDataPacket { // this is lying when it says no usage
  id: number;
  date: Date; // or string, depending on your driver config
}

export const getMask = async (ind: number, amount: number, weekEh: boolean) => {
  ind = (Math.max(1, ind) - 1) // normalize index
  amount = Math.max(1, amount)


  const days: string[] = []
  if (weekEh) {
    const normalizedInd = ind * 2 // important for the period arithmetic
    const connection = await connectToDb();

    const qPeriod = `select *
                     from periodstarts
                     order by id desc limit 1
                     offset ${String(ind)}`;

    const [results] = (await connection.execute<mysql.RowDataPacket[]>(qPeriod));
    const firstDay = results[0].date;

    let offset = 0
    getPeriod(normalizedInd).map(day => days.push(day));
    //create first period
    if (!days.includes(firstDay)) {
      getPeriod(normalizedInd + 1).map(day => days.push(day));
      offset = 1
    } else {
      getPeriod(ind - 1).map(day => days.push(day));
      offset = -1
    }
    for (let i = 1; i < amount; i++) {
      const n1 = i * 2 + normalizedInd
      getPeriod(n1).map(day => days.push(day));
      const n2 = n1 + offset
      getPeriod(n2).map(day => days.push(day));
    }
  } else { // this is the month fetcher
    const now = new Date();
    const startYear = now.getFullYear();
    const startMonth = now.getMonth() - ind;

    for (let m = 0; m < amount; m++) {
      const year = startYear;
      const month = startMonth - m;

      // Last day of this month = day 0 of next month
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = new Date(year, month, d);
        days.push(dayDate.toISOString().slice(0, 10));
      }
    }
  }
  return days.sort() // this is a list of sliced @ char 10 isostrings corresponding to the dates for our mask in any order
}