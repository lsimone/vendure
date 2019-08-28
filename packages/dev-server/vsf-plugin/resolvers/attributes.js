const { LanguageCode } = require('@vendure/core');
const { mapObj } = require('./map')
const { handleResponse, handleError } = require('./response');

// • - attributes (i.e: accessories_size(S, M, L, XL), books_music_type(books, music) )  => don't know yet
// This concept seems to map to Vendure Facets/FacetValues
// Looking at the cart stuff, it looks also doable although the way options work is quite different.
// In Vendure you don't need to specify item options, since options are implicit in the product variant id (i.e. a single product variant exists for every possible combination of options)

// "attribute_code": "books_music_type",
// "frontend_input": "select",
// "frontend_label": "Books & Music Type",
// "is_user_defined": true,
// "is_unique": false,
// "attribute_id": 208,
// "is_visible": true,
// "is_comparable": false,
// "is_visible_on_front": true,
// "position": 0,
// "id": 208,
// "options": [
//   {
//     "value": 210,
//     "label": "Books"
//   },
//   {
//     "value": 209,
//     "label": "Music"
//   }
// ]

const FRONTEND_INPUT_DEFAULT = 'select'

const ATTRIBUTE_MAP = {
    __statics: {
        frontend_input: FRONTEND_INPUT_DEFAULT,
        is_user_defined: true,
        is_unique: true,
        is_visible_on_front: true,
        is_visible: true,
        position: 0
    },
    __copy: {
        id: ['attribute_id', 'id']
    },
    code: 'attribute_code',
    name: 'frontend_label',
    'values[].id': 'options[].value',
    'values[].name': 'options[].label'
}

const mapAttribute = mapObj(ATTRIBUTE_MAP)

// const mapAttribute = facet => {
//     return {...facet, oh: 33}
// }

module.exports.getAttributes = facetService => {
    return facetService
        .findAll(LanguageCode.it)
        .then(({items}) => items.map(mapAttribute))
        .then(handleResponse)
        .catch(handleError);
};
