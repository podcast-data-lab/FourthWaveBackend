import { createHmac } from 'crypto'

export function verifyHmac(hmac: string, secret: string, body: string): boolean {
    let hmacBuffer = Buffer.from(hmac, 'hex')
    let hmacHash = createHmac('sha1', secret)
    hmacHash.update(body)
    let computedHmac = hmacHash.digest('hex')
    return hmacBuffer.equals(Buffer.from(computedHmac, 'hex'))
}
