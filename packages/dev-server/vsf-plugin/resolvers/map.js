const map = require('object-mapper')

const buildObj = (src, fn) => src && Object.keys(src).reduce((acc, key) => ({...acc, ...fn(key, src[key])}), {})

export const mapObj = enhancedModel => (obj, index, array) => {
    const { __statics, __transform, __copy, ...model } = enhancedModel

    // const transformed = __transform && Object.keys(__transform).reduce((acc, key) => ({...acc, [key]: __transform[key](obj)}), {})
    const transformed = buildObj(__transform, (key, transFn) => ({[key]: transFn(obj, index, array)}))
    const copied = buildObj(__copy, (key, destKeys) => destKeys.reduce((acc, k2) => ({...acc, [k2]: obj[key]}), {}))

    return {
        ...(__statics || {}),
        ...(transformed || {}),
        ...(copied || {}),
        ...map(obj, model)
    }
}