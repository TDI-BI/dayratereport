export const  fetchBoth = async (link:string) =>{
    let response;
    //function tries to fetch on both http and https to follow whatever ur on
    try {
        response = await fetch('http://'+link);
    }
    catch (e){
        response = await fetch('https://'+link);
    }
    return response;
}