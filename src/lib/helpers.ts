export function toCamelCase(str: string) {
    return str
        .split(' ')
        .map((word, index) => {
            if (index === 0) return word.toLocaleLowerCase()
            return word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
        })
        .join('')
}
