import { EventDefinition, FunctionDefinition } from '@rbxts/crochet';

import { t } from '@rbxts/t';

export const TestClientFunction = new FunctionDefinition<(param: string) => string>(
    'TestClientFunction',
    [t.string],
    t.string
);

export const TestFunction = new FunctionDefinition<(param1: string, parm2?: string) => string>(
    'TestFunction',
    [t.string, t.optional(t.string)],
    t.string
);

export const StringCheckFunction = new FunctionDefinition<(param: string) => boolean>(
    'StringCheckFunction',
    [t.string],
    t.boolean
);

export const TestRemoteEvent = new EventDefinition<[string, boolean, number]>('TestRemoteEvent', [
    t.string,
    t.boolean,
    t.number
]);
