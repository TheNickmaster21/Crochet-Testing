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
    // print(stringCheckFunction((1 as unknown) as string));
});

// const playerGui = game.GetService('Players').LocalPlayer.FindFirstChild('PlayerGui') as PlayerGui;

// const screenGui = new Instance('ScreenGui');
// const frame = new Instance('Frame');
// frame.Size = UDim2.fromScale(0.5, 0.5);
// frame.Position = UDim2.fromScale(0.25, 0.25);
// frame.Parent = screenGui;

// const graph = new Graph(frame);
// graph.Data = {
//     Fibby: [1, 1, 2, 3, 5, 8, 13],
//     Other: [2, 6, 3, 5, 2, 6, 2]
// };

// screenGui.Parent = playerGui;

export default {};
