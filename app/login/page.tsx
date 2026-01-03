"use client"

//next.js calls default function automatically.
export default function LoginPage() {
  const handleLogin = () => {
    const clientID = process.env.NEXT_PUBLIC_IDCS_CLIENT_ID!;
    const redirectUri = process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!;
    const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN!;


    const url = 
      `${domain}/oauth2/v1/authorize?response_type=code` +
      `&client_id=${clientID}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=openid profile email`;

    window.location.href = url;
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">
          Welcome to the portfolio!
        </h1>
      
        <p className="text-gray-300 mb-6">
          ログインしてはじめましょう
        </p>
      
        <button
          onClick={handleLogin}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg text-white font-semibold w-full"
        >
          ログイン
        </button>
      </div>
    </div>
  );
}