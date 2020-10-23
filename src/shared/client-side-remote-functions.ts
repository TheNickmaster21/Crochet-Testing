import { ClientSideRemoteFunctionWrapper } from 'shared/framework';

import t from '@rbxts/t';

export type TestClientFunction = (test: string) => string;

export class TestClientFunctionWrapper extends ClientSideRemoteFunctionWrapper<TestClientFunction> {
    private counter = 0;

    apply = (test: string) => {
        print(`server said ${test} (${++this.counter})`);
        return 'reply from TestClientFunctionWrapper';
    };

    typeChecks = [t.string];
}
