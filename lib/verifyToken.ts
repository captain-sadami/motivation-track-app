import { jwtVerify, createRemoteJWKSet } from "jose"

// get public key for a certification of token
//const JWKS_URL = process.env.JWKS_URL!
const JWKS_URL = "https://identity.oraclecloud.com/admin/v1/SigningCert/jwk"
const JWKS = createRemoteJWKSet(new URL(JWKS_URL))


export async function verifyToken(token: string) {
  console.log(JWKS)
  
  if (!token) return null
  const header = JSON.parse(
    Buffer.from(token.split('.')[0], 'base64').toString()
  )
  console.log(header)

  try {
    const { payload } = await jwtVerify(token, JWKS)

    // Data.now() returns "ms" but payload.exp returns "sec", so multiply 1000.
    if (payload.exp && Date.now() > payload.exp * 1000) {
      return null
    }

    // return payload info if try part is okay.
    return {
      userId: payload.sub,
      expiresAt: payload.exp,
    }

  // return null if try part is not okay.
  } catch (err) {
    return null
  }
}
