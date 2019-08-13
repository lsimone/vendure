import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { VSFController } from './vsf.controller'

/**
 * Vendure Storefront integration plugin exposing REST endpoints.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [VSFController],
})
export class VSFPlugin {}
