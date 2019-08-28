const { handleResponse, handleError } = require('./response')
const TAX_RULES_MOCK = require('./mocks/taxrules.json')

module.exports.getTaxrules = taxRateService => {
    return taxRateService.findAll()
        .then(handleResponse)
        .catch(handleError)
}

// SET STATIC TAXRULES EDITING THE MOCK JSON 
// TODO: mapping taxrule model
module.exports.getMockedTaxrules = taxRateService => {
    return TAX_RULES_MOCK
}