import { VendureConfig, VendurePlugin } from '@vendure/core';
import { RestModule } from './rest.module'

export class RestPlugin implements VendurePlugin {
    
    configure(config: Required<VendureConfig>) {
        // if (config.customFields.Product) {
        //     config.customFields.Product.push({
        //         type: 'string',
        //         name: 'catImageUrl',
        //     });
        // }
        return config;
    }

    defineModules() {
        return [RestModule];
    }
}
