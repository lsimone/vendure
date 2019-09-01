const { handleResponse, handleError } = require('./response')
const { del, create, pull, update } = require('../serviceMocks/cartService')

const createCart = () => create()
    .then(handleResponse)
    .catch(handleError)

const pullCart = id => pull(id)
    .then(handleResponse)
    .catch(handleError)

const updateCart = (id, item) => update(id, item)
    .then(handleResponse)
    .catch(handleError)

const deleteCart = (id, item) => del(id, item.sku)
    .then(handleResponse)
    .catch(handleError)

module.exports = { createCart, deleteCart, pullCart, updateCart }
