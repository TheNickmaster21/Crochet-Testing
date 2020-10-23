// In shared
import {
    ClientFramework, ClientSideRemoteFunctionWrapper, ServerFramework
} from 'shared/framework';

import t from '@rbxts/t';

// In shared

export class TestClientFunctionWrapper extends ClientSideRemoteFunctionWrapper<(simple: string) => number> {
    apply = (simple: string) => {
        return simple.size();
    };

    typeChecks = [t.string];
}

// In client

ClientFramework.started().then(() => {
    print('Client Framework Initialized');
    ClientFramework.bindClientSideRemoteFunction(TestClientFunctionWrapper);
});

// In server

ServerFramework.registerRemoteFunction(TestClientFunctionWrapper);

ServerFramework.start();

const clientSideFunction = ServerFramework.getClientSideRemoteFunction(TestClientFunctionWrapper);
clientSideFunction(
    game.GetService('Players').WaitForChild('TheNickmaster21') as Player,
    'hello TestClientFunctionWrapper!'
);
