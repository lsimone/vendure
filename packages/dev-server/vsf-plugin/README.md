
## VSF entities
- attributes es: accessories_size(S, M, L, XL), books_music_type(books, music), 
- categories TREE, es: Root, Default, Women, Men...
- taxrules admin-api:taxRates
- products  con type_id=configurable ha configurable_children array con dentro altri subprodotti , media_gallery e configurable_options(Color, Size)


## MICHAEL

### TODO:
POST /vsbridge/cart/create
GET /vsbridge/cart/pull
POST /vsbridge/cart/update
POST /vsbridge/cart/delete
??? GET /vsbridge/cart/totals
POST '/vsbridge/order/create`


• POST /vsbridge/user/create
This is the registerCustomerAccount mutation in Shop API. Note that if you want to also pass a password, you need to set requireVerification to false in authOptions. See https://www.vendure.io/docs/typescript-api/auth/auth-options/#requireverification
• POST /vsbridge/user/login
login mutation. simple.
• POST /vsbridge/user/resetPassword
This is the requestPasswordReset mutation.
• GET /vsbridge/user/me
• GET /vsbridge/user/order-history
These are both covered by the activeCustomer query
• POST /vsbridge/user/changePassword
This is the resetPassword mutation, but in Vendure the old password is not required (indentity is implicit if the user posesses a valid token)

### DONE
•  taxrules => vendure admin-api:taxRates
Their structure is quite different from the Vendure one. I'm not exactly sure how they map, but I guess you'll need to do quite a bit of data manipulation to get the structures to fit.
• - products  => vendure products
Looks like one of their "products" is a mix of a Vendure Product and ProductVariant, since it includes things like "description" (Product) and price (ProductVariant)
Oh they have 2 kinds - "simple" and "configurable"
Simple looks like a Vendure Product with only 1 ProductVariant.
That part looks totally doable, I think all the data is there, just needs arranging right.
• - attributes (i.e: accessories_size(S, M, L, XL), books_music_type(books, music) )  => don't know yet
This concept seems to map to Vendure Facets/FacetValues
Looking at the cart stuff, it looks also doable although the way options work is quite different.
In Vendure you don't need to specify item options, since options are implicit in the product variant id (i.e. a single product variant exists for every possible combination of options)
There is no coupon support yet.

### WON'T DO RIGHT NOW:
• GET /vsbridge/cart/payment-methods
There is currently no way to list payment methods in the Shop API. I plan to add this though.
• POST /vsbridge/cart/shipping-methods
This corresponds to the eligibleShippingMethods in the Shop API
• POST /vsbridge/cart/shipping-information
Looks like the setOrderShippingMethod mutation in Shop API
• POST /vsbridge/cart/collect-totals
I think you can just query activeOrder for this data
• POST /vsbridge/user/refresh
There is no concept of refreshing tokens in Vendure, it is not required.
• POST /vsbridge/user/me
This is covered by updateCustomer and updateCustomerAddress mutations (edited) 
• GET /vsbridge/stock/check/:sku
Stock data is not currently exposed in the Shop API.
• /vsbridge/catalog
Not quite sure how this fits in. It's just a raw Elasticsearch request/response. Is that provided already by the VSF architecture?
• /vsbridge/product/list and /vsbridge/product/render-list
It says magento-specific, and of course Vendure will not render anything for you! But the raw data just looks like the products query
I have the same question as you about the /img endpoint. Looks very similar to what the DefaultAssetPlugin provides.
POST /vsbridge/cart/apply-coupon
POST /vsbridge/cart/delete-coupon
GET /vsbridge/cart/coupon

