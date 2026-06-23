import {redirect} from "next/navigation";

const home = async () => {
  const response = await fetch(
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