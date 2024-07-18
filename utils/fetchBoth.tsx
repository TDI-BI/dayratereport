//runs fetch on both https and https://www to make sure we can query DB
export const  fetchBoth = async (link:string) =>{
    let response;
    //function tries to fetch on both http and https to follow whatever ur on
    try {
        response = await fetch('http://'+link); // remember to put the s back on
    }
    catch (e){
        response = await fetch('https://www.'+link);
    }
    return response;
}
