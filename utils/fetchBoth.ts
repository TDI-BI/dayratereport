export const fetchBoth = async (path: string, init?: RequestInit) => {
  try {
    return await fetch(`${process.env.NEXT_PUBLIC_TYPE!}${process.env.NEXT_PUBLIC_URL!}${path}`, init);
  } catch (e) {
    return await fetch(`${process.env.NEXT_PUBLIC_TYPE!}www.${process.env.NEXT_PUBLIC_URL!}${path}`, init);
  }
};
