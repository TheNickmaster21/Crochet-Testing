import { ClientFramework, FunctionDefinition, ServerFramework } from 'shared/framework';

// In shared

export const TestClientFunction = new FunctionDefinition<[string], number>();

// In client

ClientFramework.started().then(() => {
    print('Client Framework Initialized');
    ClientFramework.bindClientSideRemoteFunction(TestClientFunction, (param: string) => {
        return param.size();
    });
});

// In server

ServerFramework.registerRemoteFunction(TestClientFunction);

ServerFramework.start();

const clientSideFunction = ServerFramework.getClientSideRemoteFunction(TestClientFunction);
clientSideFunction(
    game.GetService('Players').WaitForChild('TheNickmaster21') as Player,
    'hello TestClientFunctionWrapper!'
);
