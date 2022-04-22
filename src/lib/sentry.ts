import { init, startTransaction, captureException } from '@sentry/node'

export const initializeSentry = () => {
    init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.ENVIORNMENT,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 0.5,
    })
}
