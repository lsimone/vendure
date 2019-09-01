const { handleResponse, handleError } = require('./response')
const { mapObj } = require('./map')

const addItemToOrder = async (variantService, orderService, ctx, orderId, productId, sku, qty) => {
    const variants = await variantService.getVariantsByProductId(ctx, productId)
    await orderService.addItemToOrder(ctx, orderId, (variants.find(v => v.sku === sku)).id, qty)
}

    // fullName?: Maybe<Scalars['String']>;
    // company?: Maybe<Scalars['String']>;
    // streetLine1: Scalars['String'];
    // streetLine2?: Maybe<Scalars['String']>;
    // city?: Maybe<Scalars['String']>;
    // province?: Maybe<Scalars['String']>;
    // postalCode?: Maybe<Scalars['String']>;
    // countryCode: Scalars['String'];
    // phoneNumber?: Maybe<Scalars['String']>;

    // defaultShippingAddress?: Maybe<Scalars['Boolean']>;
    // defaultBillingAddress?: Maybe<Scalars['Boolean']>;
    // customFields?: Maybe<Scalars['JSON']>;

const SHIPPING_ADDRESS_MAP = {
    __transform: {
        fullName: ({firstname, lastname}) => `${firstname} ${lastname}`,
        streetLine1: ({street: [streetName, streetNumber]}) => `${streetName}, ${streetNumber}`
    },
    'city': 'city',
    'region': 'province',
    'postcode': 'postalCode',
    'telephone': 'phoneNumber',
    'company': 'company',
    'country_id': 'countryCode'
}

const mapShippingAddress = mapObj(SHIPPING_ADDRESS_MAP)

const createOrder = ( orderService, variantService, ctx, orderData ) => {
    return orderService.create(ctx, orderData.user_id)
        .then(async order => {
            await Promise.all([
                // orderService.setShippingAddress(ctx, order.id, shippingAddress), 
                ...orderData.products.map(p => addItemToOrder(variantService, orderService, ctx, order.id, p.product_id, p.sku, p.qty))])    
            await orderService.setShippingAddress(ctx, order.id, mapShippingAddress(orderData.addressInformation.shippingAddress))
        })
        .then(() => 'OK')
        .then(handleResponse)
        .catch(handleError)
        
        // TODO: add customer
}

module.exports = { createOrder }

// REQUEST:
// {
//     "user_id": "",
//     "cart_id": "d90e9869fbfe3357281a67e3717e3524",
//     "products": [
//         {
//             "sku": "WT08-XS-Yellow",
//             "qty": 1
//         }
//     ],
//     "addressInformation": {
//         "shippingAddress": {
//             "region": "",
//             "region_id": 0,
//             "country_id": "PL",
//             "street": [
//                 "Example",
//                 "12"
//             ],
//             "company": "NA",
//             "telephone": "",
//             "postcode": "50-201",
//             "city": "Wroclaw",
//             "firstname": "Piotr",
//             "lastname": "Karwatka",
//             "email": "pkarwatka30@divante.pl",
//             "region_code": ""
//         },
//         "billingAddress": {
//             "region": "",
//             "region_id": 0,
//             "country_id": "PL",
//             "street": [
//                 "Example",
//                 "12"
//             ],
//             "company": "Company name",
//             "telephone": "",
//             "postcode": "50-201",
//             "city": "Wroclaw",
//             "firstname": "Piotr",
//             "lastname": "Karwatka",
//             "email": "pkarwatka30@divante.pl",
//             "region_code": "",
//             "vat_id": "PL88182881112"
//         },
//         "shipping_method_code": "flatrate",
//         "shipping_carrier_code": "flatrate",
//         "payment_method_code": "cashondelivery",
//         "payment_method_additional": {}
//     },
//     "order_id": "1522811662622-d3736c94-49a5-cd34-724c-87a3a57c2750",
//     "transmited": false,
//     "created_at": "2018-04-04T03:14:22.622Z",
//     "updated_at": "2018-04-04T03:14:22.622Z"
// }