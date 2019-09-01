const uuid = require('uuid/v1')

const cache = {}

const getKey = obj => Object.keys(obj)[0]
const getValue = obj => obj[Object.keys(obj)[0]]

const get = id => {
    if (!id) {
        id = uuid()
        console.log(`creating cartUuid: ${id}`)
    } 
    if (!cache[id]) {
        console.log(`creating cart with id: ${id}`)
        cache[id] = []
    }
    return Promise.resolve({[id]: cache[id]})
}

const create = () => get()
    .then(getKey)

const pull = id => get(id)
    .then(getValue)

const update = async (cartId, item) => {
    const cart = getValue(await get(cartId))
    const itemToUpdate = cart.find(i => i.sku === item.sku)
    if (!itemToUpdate) {
        cart.push(item)
    } else {
        Object.assign(itemToUpdate, item)
    }
    return item
}

const del = (cartId, sku) => {
    console.log(`deleting item ${sku} from cart: ${cartId}`)
    if (cache[cartId]) {
        console.log(`found cart: deleting item ${sku} from cart: ${cartId}`)
        cache[cartId] = cache[cartId].filter(item => item.sku !== sku)
    }
    return Promise.resolve(true)
}

module.exports = { create, pull, update, del }