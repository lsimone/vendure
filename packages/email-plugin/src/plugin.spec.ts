/* tslint:disable:no-non-null-assertion */
import { Test, TestingModule } from '@nestjs/testing';
import path from 'path';

import { LanguageCode } from '../../common/lib/generated-types';
import { DEFAULT_CHANNEL_CODE } from '../../common/lib/shared-constants';
import { Order } from '../../core/dist/entity/order/order.entity';
import { EventBus } from '../../core/dist/event-bus/event-bus';
import { OrderStateTransitionEvent } from '../../core/dist/event-bus/events/order-state-transition-event';
import { VendureEvent } from '../../core/dist/event-bus/vendure-event';

import { orderConfirmationHandler } from './default-email-handlers';
import { EmailEventHandler, EmailEventListener } from './event-listener';
import { EmailPlugin } from './plugin';
import { EmailPluginOptions } from './types';

describe('EmailPlugin', () => {
    let plugin: EmailPlugin;
    let eventBus: EventBus;
    let onSend: jest.Mock;

    async function initPluginWithHandlers(
        handlers: Array<EmailEventHandler<string, any>>,
        options?: Partial<EmailPluginOptions>,
    ) {
        onSend = jest.fn();
        const module = await Test.createTestingModule({
            imports: [
                EmailPlugin.init({
                    templatePath: path.join(__dirname, '../test-templates'),
                    transport: {
                        type: 'testing',
                        onSend,
                    },
                    handlers,
                    ...options,
                }),
            ],
        }).compile();

        plugin = module.get(EmailPlugin);
        eventBus = module.get(EventBus);
        await plugin.onVendureBootstrap();
        return module;
    }

    describe('event filtering', () => {
        const ctx = {
            channel: { code: DEFAULT_CHANNEL_CODE },
            languageCode: LanguageCode.en,
        } as any;

        it('single filter', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .filter(event => event.shouldSend === true)
                .setRecipient(() => 'test@test.com')
                .setSubject('test subject');

            const module = await initPluginWithHandlers([handler]);

            eventBus.publish(new MockEvent(ctx, false));
            await pause();
            expect(onSend).not.toHaveBeenCalled();

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend).toHaveBeenCalledTimes(1);
            await module.close();
        });

        it('multiple filters', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .filter(event => event.shouldSend === true)
                .filter(event => !!event.ctx.user)
                .setRecipient(() => 'test@test.com')
                .setSubject('test subject');

            const module = await initPluginWithHandlers([handler]);

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend).not.toHaveBeenCalled();

            eventBus.publish(new MockEvent({ ...ctx, user: 'joe' }, true));
            await pause();
            expect(onSend).toHaveBeenCalledTimes(1);
            await module.close();
        });
    });

    describe('templateVars', () => {
        const ctx = {
            channel: { code: DEFAULT_CHANNEL_CODE },
            languageCode: LanguageCode.en,
        } as any;

        it('interpolates subject', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .setRecipient(() => 'test@test.com')
                .setSubject('Hello {{ subjectVar }}')
                .setTemplateVars(event => ({ subjectVar: 'foo' }));

            const module = await initPluginWithHandlers([handler]);

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend.mock.calls[0][0].subject).toBe('Hello foo');
            await module.close();
        });

        it('interpolates body', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .setRecipient(() => 'test@test.com')
                .setSubject('Hello')
                .setTemplateVars(event => ({ testVar: 'this is the test var' }));

            const module = await initPluginWithHandlers([handler]);

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend.mock.calls[0][0].body).toContain('this is the test var');
            await module.close();
        });

        it('interpolates globalTemplateVars', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .setRecipient(() => 'test@test.com')
                .setSubject('Hello {{ globalVar }}');

            const module = await initPluginWithHandlers([handler], {
                globalTemplateVars: { globalVar: 'baz' },
            });

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend.mock.calls[0][0].subject).toBe('Hello baz');
            await module.close();
        });

        it('globalTemplateVars available in setTemplateVars method', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .setRecipient(() => 'test@test.com')
                .setSubject('Hello {{ testVar }}')
                .setTemplateVars((event, globals) => ({ testVar: globals.globalVar + ' quux' }));

            const module = await initPluginWithHandlers([handler], {
                globalTemplateVars: { globalVar: 'baz' },
            });

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend.mock.calls[0][0].subject).toBe('Hello baz quux');
            await module.close();
        });

        it('setTemplateVars overrides globals', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .setRecipient(() => 'test@test.com')
                .setSubject('Hello {{ name }}')
                .setTemplateVars((event, globals) => ({ name: 'quux' }));

            const module = await initPluginWithHandlers([handler], { globalTemplateVars: { name: 'baz' } });

            eventBus.publish(new MockEvent(ctx, true));
            await pause();
            expect(onSend.mock.calls[0][0].subject).toBe('Hello quux');
            await module.close();
        });
    });

    describe('multiple configs', () => {
        const ctx = {
            channel: { code: DEFAULT_CHANNEL_CODE },
            languageCode: LanguageCode.en,
        } as any;

        it('additional LanguageCode', async () => {
            const handler = new EmailEventListener('test')
                .on(MockEvent)
                .setSubject('Hello, {{ name }}!')
                .setRecipient(() => 'test@test.com')
                .setTemplateVars(() => ({ name: 'Test' }))
                .addTemplate({
                    channelCode: 'default',
                    languageCode: LanguageCode.de,
                    templateFile: 'body.de.hbs',
                    subject: 'Servus, {{ name }}!',
                });

            const module = await initPluginWithHandlers([handler]);

            eventBus.publish(new MockEvent({ ...ctx, languageCode: LanguageCode.ta }, true));
            await pause();
            expect(onSend.mock.calls[0][0].subject).toBe('Hello, Test!');
            expect(onSend.mock.calls[0][0].body).toContain('Default body.');

            eventBus.publish(new MockEvent({ ...ctx, languageCode: LanguageCode.de }, true));
            await pause();
            expect(onSend.mock.calls[1][0].subject).toBe('Servus, Test!');
            expect(onSend.mock.calls[1][0].body).toContain('German body.');
            await module.close();
        });
    });

    describe('orderConfirmationHandler', () => {
        let module: TestingModule;
        beforeEach(async () => {
            module = await initPluginWithHandlers([orderConfirmationHandler], {
                templatePath: path.join(__dirname, '../templates'),
            });
        });

        afterEach(async () => {
            await module.close();
        });

        const ctx = {
            channel: { code: DEFAULT_CHANNEL_CODE },
            languageCode: LanguageCode.en,
        } as any;

        const order = ({
            code: 'ABCDE',
            customer: {
                emailAddress: 'test@test.com',
            },
        } as Partial<Order>) as any;

        it('filters events with wrong order state', async () => {
            eventBus.publish(new OrderStateTransitionEvent('AddingItems', 'ArrangingPayment', ctx, order));
            await pause();
            expect(onSend).not.toHaveBeenCalled();

            eventBus.publish(new OrderStateTransitionEvent('AddingItems', 'Cancelled', ctx, order));
            await pause();
            expect(onSend).not.toHaveBeenCalled();

            eventBus.publish(new OrderStateTransitionEvent('AddingItems', 'PaymentAuthorized', ctx, order));
            await pause();
            expect(onSend).not.toHaveBeenCalled();

            eventBus.publish(new OrderStateTransitionEvent('ArrangingPayment', 'PaymentSettled', ctx, order));
            await pause();
            expect(onSend).toHaveBeenCalledTimes(1);
        });

        it('sets the Order Customer emailAddress as recipient', async () => {
            eventBus.publish(new OrderStateTransitionEvent('ArrangingPayment', 'PaymentSettled', ctx, order));
            await pause();

            expect(onSend.mock.calls[0][0].recipient).toBe(order.customer!.emailAddress);
        });

        it('sets the subject', async () => {
            eventBus.publish(new OrderStateTransitionEvent('ArrangingPayment', 'PaymentSettled', ctx, order));
            await pause();

            expect(onSend.mock.calls[0][0].subject).toBe(`Order confirmation for #${order.code}`);
        });
    });
});

const pause = () => new Promise(resolve => setTimeout(resolve, 50));

class MockEvent extends VendureEvent {
    constructor(public ctx: any, public shouldSend: boolean) {
        super();
    }
}
