export interface IOptions {
    secret: string
    maxContentSize?: number
    leaseSeconds: number
    mode: 'subscribe' | 'unsubscribe'
    topic: string
    hub: string
    callbackUrl: string
}
