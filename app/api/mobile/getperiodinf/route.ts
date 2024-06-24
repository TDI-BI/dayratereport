import { NextRequest } from 'next/server';
import { getPeriod } from '@/utils/payperiod';
import { connectToDb } from '@/utils/connectToDb'
//this works on pulling individual days!

export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const uid = searchParams.get('uid') || '';
    if(uid==''){
        return new Response(JSON.stringify({ error: 'no uid in query' }))
    }
  
  //query building
  const period = await getPeriod();
  let dparam:string = "(day='-1' ";
  period.forEach((item)=>{
    dparam+="or day='"+item+"'";
  });
  dparam+=")"
  //building the query like this feels deeply unserious but whatever lol

  const connection = await connectToDb();

  try {
    const values: string[] = [];
    const query = "SELECT * FROM days WHERE username='"+uid+"' AND "+dparam; //q shuold generate
    //console.log(query)
    
    const [results] = await connection.execute(query, values);
    connection.end();

    return new Response(JSON.stringify({ resp: results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },

      
    });
  } catch (error) {
    if(error instanceof Error){
      return new Response(JSON.stringify({ error: error.message }), { 
        // idk why this throws an eror, doesnt stop the program from running though so ill ignore it :)
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
}