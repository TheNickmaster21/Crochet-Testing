import { ServerSideRemoteFunctionWrapper } from 'shared/framework';

import t from '@rbxts/t';

export type TestFunction = (test: string) => string;

export class TestFunctionWrapper extends ServerSideRemoteFunctionWrapper<TestFunction> {
    private counter = 0;

    apply = (player: Player, test: string) => {
        print(`${player.Name} said ${test} (${++this.counter})`);
        return 'reply from TestFunctionWrapper';
    };

    typeChecks = [t.string];
}

export type StringCheckFunction = (test: string) => boolean;

export class StringCheckFunctionWrapper extends ServerSideRemoteFunctionWrapper<StringCheckFunction> {
    apply = (player: Player, test: string) => {
        return true;
    };

    typeChecks = [t.string];
}
