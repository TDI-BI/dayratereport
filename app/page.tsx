import {redirect} from "next/navigation";
import {fetchBoth} from "@/utils/fetchBoth";

const home = async () => {
  const response = await fetchBoth(`/api/account/whereto`);
  const data = await response.json();

  if (data.success) {
    redirect(data.redirect);
  } else {
    redirect("/login");
  }
};

export default home;
