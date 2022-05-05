export {}

declare global {
    interface Array<T> {
        /**
         * Tests if any element in the array matches the predicate.
         *
         * [Reference](https://github.com/ornstio-development/ts-linq/blob/master/projects/ts-linq/src/extensions/any.ts#L1)
         */
        any(this: Array<T>, func?: (t: T, i: number) => boolean): boolean

        /**
         * Get's the first element in the array
         *
         * @param this
         * @param function - optional method to match an element and return the first occurence
         * @returns - the first element of the array or null if no result
         *
         * [Code Reference](https://github.com/ornstio-development/ts-linq/blob/master/projects/ts-linq/src/extensions/first.ts#L1)
         */
        // first(this: Array<T>, func?: () => any): T
        first(this: Array<T>, func?: (t: T, i: number) => boolean): T
    }
}

export function first<T>(this: Array<T>, func?: (t: T, i: number) => boolean): T {
    return this.find((_, i) => (func ? func(_, i) : true))
}

export function any<T>(this: Array<T>, func?: (t: T, i: number) => boolean): boolean {
    return func ? this.some((_, i) => func(_, i)) : this.length > 0
}

Array.prototype.first = first
Array.prototype.any = any
