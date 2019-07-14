import { MockClass } from '../../testing/testing-types';
import { RequestContextService } from '../../../dist/api/common/request-context.service';

export class MockRequestContextService implements MockClass<RequestContextService> {
    
    fromRequest() {
        return Promise.resolve()
    }

    isGraphQl() {
        return true;
    }

}
