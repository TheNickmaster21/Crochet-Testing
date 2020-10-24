import { TestClientFunction } from 'shared/client-side-remote-functions';
import { ClientFramework as Framework } from 'shared/framework';
import { StringCheckFunction, TestFunction } from 'shared/server-side-remote-functions';

Framework.started().then(() => {
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
});

export default {};
