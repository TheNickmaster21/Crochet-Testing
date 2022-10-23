import { Controller, CrochetClient, FunctionDefinition } from '@rbxts/crochet';
import { NumberDisplayComponent, NumberDisplayTag } from './components/number-display.component';
import { StringCheckFunction, TestClientFunction, TestFunction, TestRemoteEvent } from 'shared/remotes';

class TestController implements Controller {
    public test(): void {
        print('I have been tested');
    }
}

CrochetClient.registerController(TestController);

CrochetClient.registerTagComponentForTag(NumberDisplayComponent, NumberDisplayTag);

CrochetClient.start().await();

print('Client Framework Initialized');

CrochetClient.getController(TestController).test();

let counter = 0;
// This is deprecated but let's test it anyways
CrochetClient.bindClientSideRemoteFunction(TestClientFunction, (test: string) => {
    print(`server said ${test} (${++counter})`);
    return 'reply from TestClientFunctionWrapper';
});

const testFunction = CrochetClient.getServerSideRemoteFunction(TestFunction);
print(`Server replied ${testFunction('test 2 from client')}`);
const stringCheckFunction = CrochetClient.getServerSideRemoteFunction(StringCheckFunction);
print(stringCheckFunction('abcd'));

const stringCheckPromiseFunction = CrochetClient.getServerSideRemotePromiseFunction(StringCheckFunction);

print('point 1');
stringCheckPromiseFunction('abc').then(() => print('point 2'));
print('point 3 (but comes before 2)');

const ClientBindableFunction = new FunctionDefinition<(n1: number, n2: number) => number>('ClientBindableFunction');
CrochetClient.registerBindableFunction(ClientBindableFunction);
CrochetClient.bindBindableFunction(ClientBindableFunction, (a: number, b: number) => a * b);

print(`3x6=${CrochetClient.getBindableFunction(ClientBindableFunction)(3, 6)}`);

CrochetClient.bindRemoteEvent(TestRemoteEvent, (str, bool, num) => {
    print(str, bool, num);
});

const fireRemoteEvent = CrochetClient.getRemoteEventFunction(TestRemoteEvent);
fireRemoteEvent('from client', false, 42);
