const { handleResponse, handleError } = require('./response')

/**
 * mocked infinite stock
 * @param {String} sku 
 */
const mockStockForNonFiniteProduct = sku => Promise.resolve({
    is_in_stock: true,
    qty: 100000
})

module.exports.getStock = sku => {
    return mockStockForNonFiniteProduct(sku)
        .then(handleResponse)
        .catch(handleError)
}