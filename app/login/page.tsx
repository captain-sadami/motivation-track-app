"use client"

//next.js calls default function automatically.
export default function LoginPage() {
  const handleLogin = () => {
    const clientID = process.env.NEXT_PUBLIC_IDCS_CLIENT_ID!;
    const redirectUri = encodeURIComponent("http://localhost:3000/auth/callback")
    const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN!;


    const url = 
      `${domain}/oauth2/v1/authorize?response_type=code` +
      `&client_id=${clientID}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=openid`;

    window.location.href = url;
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome to the portfolio!</h1>
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}