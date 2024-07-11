export const  fetchBoth = async (link:string) =>{
    let response;
    //function tries to fetch on both http and https to follow whatever ur on
    response = await fetch('http://'+link);
    try {
         // remember to put the s back on
    }
    catch (e){
        //response = await fetch('https://www.'+link);
    }
    return response;
}
