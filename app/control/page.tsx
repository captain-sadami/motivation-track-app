import ControlClient from "./ControlClient";
import { cookies } from "next/headers"


export default async function ControlPage(){
  // cookies is exptracted from request from brower..
  const cookie = await cookies()
  const token = cookie.get("access_token")?.value;
  const idToken = cookie.get("id_token")?.value;

  if (!idToken || !token) { return <div>No token found</div> }

  // try to get user info with access token.
  const resp = await fetch(process.env.IDCS_USERINFO_ENDPOINT!, {
      headers: {
          Authorization: `Bearer ${token}`,
      }
  })

  if (resp.status===401 || resp.status===403) { 
    return ("/login");
  }
  if (!resp.ok) {
    throw new Error("IDCS userinfo endpoint error");
  }

  // resp is Response object, so convert to json format.
  // Indetifying an user on "Identity domains"
  const user = await resp.json()
  const username = user.name ?? "No username found"

  // multiple react component's argument can not be argument, but only one argument is allowd.
  // Props is {"impulses": Impulse[]}, the left part of below corresponding to the key name of props.
  return (
    <>
      <div className="max-w-2xl mx-auto flex flex-col space-y-10 pt-12">
        <h1 className="text-xl font-semibold text-gray-200">
          Beat yourself, {username.split(" ")[0]}!!
        </h1>
        <ControlClient />
      </div>
    </>
  )
}
