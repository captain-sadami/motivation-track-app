import ControlClient from "./ControlClient";
import { getAppUser } from "@/lib/getAppUser";
import { redirect } from "next/navigation";


export default async function ControlPage(){
  const user = await getAppUser();
  if (!user){
    redirect("/login");
  }
  
  // multiple react component's argument can not be argument, but only one argument is allowd.
  // Props is {"impulses": Impulse[]}, the left part of below corresponding to the key name of props.
  return (
    <>
      <div className="max-w-2xl mx-auto flex flex-col space-y-10 pt-12">
        <h1 className="text-xl font-semibold text-gray-200">
          Beat yourself, {user.username.split(" ")[0]}!!
        </h1>
        <ControlClient />
      </div>
    </>
  )
}
