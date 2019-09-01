import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import {
    CollectionService,
    Ctx,
    FacetService,
    ProductService,
    ProductVariantService,
    ProductOptionGroupService,
    RequestContext,
    ShippingMethodService,
    TaxRateService,
    OrderService,
    CustomerService
} from '@vendure/core';

import { auth } from './resolvers/auth';
import { getCategories } from './resolvers/categories.js';
import { getProducts } from './resolvers/products';
import { getAttributes } from './resolvers/attributes';
import { getMockedTaxrules } from './resolvers/taxrules';
import { createCart, deleteCart, pullCart, updateCart } from './resolvers/cart';
import { getStock } from './resolvers/stock';
import { createOrder } from './resolvers/orders';

@Controller('vsbridge')
export class VSFController {
    constructor(
        private shippingMethodService: ShippingMethodService,
        private customerService: CustomerService,
        private orderService: OrderService,
        private taxRateService: TaxRateService,
        private productService: ProductService,
        private productVariantService: ProductVariantService,
        private productOptionGroupService: ProductOptionGroupService,
        private collectionService: CollectionService,
        private facetService: FacetService,
    ) {}

    @Post('auth/admin')
    auth(): object {
        return auth();
    }

    //  GET /vsbridge/attributes/index
    //  GET /vsbridge/attributes/index [OTTIENI / vsbridge / attributi / indice]
    //  This method is used to get all the attributes from Magento
    @Get('attributes/index')
    getAttributes(): object {
        // TODO: remove hardcoded languagecode
        return getAttributes(this.facetService)
    }

    // GET /vsbridge/categories/index
    // exclamation Note: while this method should return the full category tree, it won't work out out of the box with vue-storefront SidebarMenu.js. It requires you the first node to have level of 2 contrary to level 0 in example below.
    // https://github.com/vendure-ecommerce/vendure/blob/master/admin-ui/src/app/catalog/components/collection-tree/array-to-tree.ts
    @Get('categories/index')
    getCategories(@Ctx() ctx: RequestContext): object {
        return getCategories(ctx, this.collectionService)
    }

    // GET /taxrules/index
    @Get('taxrules/index')
    getTaxRules(): object {
        return getMockedTaxrules(this.taxRateService)
    }

    @Get('products/index')
    getProducts(@Ctx() ctx: RequestContext) {
        // this.productOptionGroupService.findOne(ctx, id)
        return getProducts(this.productService, this.productVariantService, this.productOptionGroupService, this.collectionService, this.facetService, ctx)
    }

    /**
     * CART MODULE
     * https://github.com/DivanteLtd/vue-storefront-integration-boilerplate/blob/master/1.%20Expose%20the%20API%20endpoints%20required%20by%20VS/Required%20API%20specification.md#cart-module
     */

    // POST /vsbridge/cart/create
    // https://github.com/DivanteLtd/vue-storefront-integration-boilerplate/blob/master/1.%20Expose%20the%20API%20endpoints%20required%20by%20VS/Required%20API%20specification.md#cart-module
    @Post('cart/create')
    createCart(): object {
        return createCart()
    }

    // GET /vsbridge/cart/pull
    // Method used to fetch the current server side shopping cart content, used mostly for synchronization purposes when config.cart.synchronize=true
    @Get('cart/pull')
    getCart(@Query('cartId') cartId: String): object {
        return pullCart(cartId)
    }

    // POST /vsbridge/cart/update
    // param cartId
    // Method used to add or update shopping cart item's server side. As a request body there should be JSON given representing the cart item. sku and qty are the two required options. If you like to update/edit server cart item You need to pass item_id identifier as well (can be obtainted from api/cart/pull)
    @Post('cart/update')
    updateCart(@Query('cartId') cartId: String, @Body() cartItem: object): object {
        return updateCart(cartId, cartItem)
    }

    // POST /vsbridge/cart/delete
    @Post('cart/delete')
    deleteCart(@Query('cartId') cartId: String, @Body() cartItem: object): object {
        return deleteCart(cartId, cartItem)
    }

    // POST /vsbridge/cart/apply-coupon
    @Post('cart/apply-coupon')
    applyCouponToCart(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/cart/delete-coupon
    @Post('cart/delete-coupon')
    deleteCouponFromCart(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // GET /vsbridge/cart/coupon
    @Get('cart/coupon')
    getCartCoupon(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // GET /vsbridge/cart/totals
    @Get('cart/totals')
    getCartTotals(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // GET /vsbridge/cart/payment-methods
    @Get('cart/payment-methods')
    getPaymentMethods(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/cart/shipping-methods
    @Post('cart/shipping-methods')
    addShippingMethod(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/cart/shipping-information
    @Post('cart/shipping-information')
    addShippingInformation(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/cart/collect-totals
    // This method is called to update the quote totals just after the address information has been changed.
    @Post('cart/collect-totals')
    updateCartTotals(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/user/create
    @Post('user/create')
    createUser(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/user/login
    @Post('user/login')
    login(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/user/refresh
    @Post('user/refresh')
    refreshToken(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/user/resetPassword
    @Post('user/resetPassword')
    resetPassword(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }
    
    // POST /vsbridge/user/changePassword
    @Post('user/changePassword')
    changePassword(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // GET /vsbridge/user/order-history
    @Get('user/order-history')
    getOrders(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // GET /vsbridge/user/me
    @Get('user/me')
    getMe(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // POST /vsbridge/user/me
    // Updates the user address and other data information
    @Post('user/me')
    updateMe(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // GET /vsbridge/stock/check/:sku
    @Get('stock/check')
    getStock(@Query('sku') sku: string): object {
        return getStock(sku)
    }

    // POST '/vsbridge/order/create`
    @Post('order/create')
    createOrder(@Ctx() ctx: RequestContext, @Body() order: object): object {
        // return this.orderService.setShippingAddress(ctx, 1, {streetLine1: 'ew', countryCode: 'IT'})
        // this.orderService.setShippingAddress()
        // this.orderService.addItemToOrder() // ctx, orderId, variantId, quantity, customFields
        // this.orderService.addCustomerToOrder() // orderId, customer
        // this.orderService.
        return createOrder(this.orderService, this.productVariantService, ctx, order)
        // const ord = await this.orderService.create(ctx, order.user_id)
        // order.products.forEach(p => this.orderService.addItemToOrder(ctx, ord.id, getProductVariantId(p), p.qty, {size: pullCart.size}))
    }

    // TBD ???
    // GET /vsbridge/stock/list
    // This method is used to check multiple stock items for specified product skus. Requires skus param of comma-separated values to indicate which stock items to return.
    @Get('stock/list')
    getStocks(): object {
        return { res: 'TO BE IMPLEMENTED' };
    }

    // TODO: to be proxied to api-vuestorefront:
    // GET /img
    // GET /vsbridge/catalog
    // GET /vsbridge/product/list 
    // GET /vsbridge/product/render-list

}
