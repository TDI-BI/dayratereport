import {getSession} from "@/actions";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import {fetchBoth} from "@/utils/fetchboth";

const home = async () => {
  const session = await getSession();

  const response = await fetchBoth(
    `/api/account/whereto`,
  );
  const data = await response.json();

  if (data.success) {
    redirect(data.redirect);
  } else {
    redirect("/login");
  }
};

export default home;