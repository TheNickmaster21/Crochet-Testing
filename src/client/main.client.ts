import { Controller, CrochetClient as Crochet, FunctionDefinition } from '@rbxts/crochet';
import { StringCheckFunction, TestClientFunction, TestFunction, TestRemoteEvent } from 'shared/remotes';

class TestController implements Controller {
    public test(): void {
        print('I have been tested');
    }
}

Crochet.registerController(TestController);

Crochet.start().await();

print('Client Framework Initialized');

Crochet.getController(TestController).test();

let counter = 0;
Crochet.bindClientSideRemoteFunction(TestClientFunction, (test: string) => {
    print(`server said ${test} (${++counter})`);
    return 'reply from TestClientFunctionWrapper';
});

const testFunction = Crochet.getServerSideRemoteFunction(TestFunction);
print(`Server replied ${testFunction('test 2 from client')}`);
const stringCheckFunction = Crochet.getServerSideRemoteFunction(StringCheckFunction);
print(stringCheckFunction('abcd'));

const stringCheckPromiseFunction = Crochet.getServerSideRemotePromiseFunction(StringCheckFunction);

print('point 1');
stringCheckPromiseFunction('abc').then(() => print('point 2'));
print('point 3 (but comes before 2)');

const ClientBindableFunction = new FunctionDefinition<(n1: number, n2: number) => number>('ClientBindableFunction');
Crochet.registerBindableFunction(ClientBindableFunction);
Crochet.bindBindableFunction(ClientBindableFunction, (a: number, b: number) => a * b);

print(`3x6=${Crochet.getBindableFunction(ClientBindableFunction)(3, 6)}`);

Crochet.bindRemoteEvent(TestRemoteEvent, (str, bool, num) => {
    print(str, bool, num);
});

const fireRemoteEvent = Crochet.getRemoteEventFunction(TestRemoteEvent);
fireRemoteEvent('from client', false, 42);

export default {};
