import { TestClientFunction } from 'shared/client-side-remote-functions';
import { ClientFramework as Framework, FunctionDefinition } from 'shared/framework';
import { StringCheckFunction, TestFunction } from 'shared/server-side-remote-functions';

Framework.started().await();

print('Client Framework Initialized');

let counter = 0;
Framework.bindClientSideRemoteFunction(TestClientFunction, (test: string) => {
    print(`server said ${test} (${++counter})`);
    return 'reply from TestClientFunctionWrapper';
});

const testFunction = Framework.getServerSideRemoteFunction(TestFunction);
print(`Server replied ${testFunction('test 2 from client')}`);
const stringCheckFunction = Framework.getServerSideRemoteFunction(StringCheckFunction);
print(stringCheckFunction('abcd'));

const stringCheckPromiseFunction = Framework.getServerSideRemotePromiseFunction(StringCheckFunction);

print('point 1');
stringCheckPromiseFunction('abc').then(() => print('point 2'));
print('point 3 (but comes before 2)');

const ClientBindableFunction = new FunctionDefinition<[number, number], number>('ClientBindableFunction');
Framework.registerBindableFunction(ClientBindableFunction);
Framework.bindBindableFunction(ClientBindableFunction, (a: number, b: number) => a * b);

print(`3x6=${Framework.getBindableFunction(ClientBindableFunction)(3, 6)}`);

export default {};
