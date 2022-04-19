import { registerEnumType } from 'type-graphql'

export enum UiMode {
    Dark = 'DARK',
    Light = 'LIGHT',
}

registerEnumType(UiMode, {
    name: 'UiMode',
    description: 'UI Mode - Either \'"Light" or "Dark"',
})
