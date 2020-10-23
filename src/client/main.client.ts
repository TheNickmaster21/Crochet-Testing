import { TestClientFunction, TestClientFunctionWrapper } from 'shared/client-side-remote-functions';
import { ClientFramework as Framework } from 'shared/framework';
import {
    StringCheckFunction, StringCheckFunctionWrapper, TestFunction, TestFunctionWrapper
} from 'shared/server-side-remote-functions';

Framework.started().then(() => {
    print('Client Framework Initialized');
    Framework.bindClientSideRemoteFunction<TestClientFunction>(TestClientFunctionWrapper);

    const testFunction = Framework.getServerSideRemoteFunction<TestFunction>(TestFunctionWrapper);
    print(`Server replied ${testFunction('test 2 from client')}`);
    const stringCheckFunction = Framework.getServerSideRemoteFunction<StringCheckFunction>(StringCheckFunctionWrapper);
    print(stringCheckFunction('abcd'));

    const stringCheckPromiseFunction = Framework.getServerSideRemotePromiseFunction<StringCheckFunction>(
        StringCheckFunctionWrapper
    );

    print('point 1');
    stringCheckPromiseFunction('abc').then(() => print('point 2'));
    print('point 3 (but comes before 2)');
});

export default {};
