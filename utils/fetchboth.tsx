export const fetchBoth = async (inc:string) => {
    try{
        return await fetch(`${process.env.NEXT_PUBLIC_TYPE!}${process.env.NEXT_PUBLIC_URL!}${inc}`)
    }
    catch(e){
        return await fetch(`${process.env.NEXT_PUBLIC_TYPE!}www.${process.env.NEXT_PUBLIC_URL!}${inc}`)
    }

}