import { TestClientFunctionWrapper } from 'shared/client-side-remote-functions';
import { OnHeartbeat, OnInit, ServerFramework as Framework, Service } from 'shared/framework';

import {
    StringCheckFunction, StringCheckFunctionWrapper, TestFunction, TestFunctionWrapper
} from '../shared/server-side-remote-functions';
import { ColorService } from './color.service';
import { TestService } from './test.service';
import { TimeService } from './time.service';

class TestHelloService extends Service {
    sayHello(): void {
        print('hello');
    }
}

class TestGoodbyeService extends Service {
    sayGoodbye(): void {
        print('goodbye');
    }
}

class TestLifeService extends Service implements OnInit {
    public testHelloService?: TestHelloService = undefined;
    public testGoodbyeService?: TestGoodbyeService = undefined;

    public onInit(): void {
        this.testHelloService = Framework.getService(TestHelloService);
        this.testGoodbyeService = Framework.getService(TestGoodbyeService);
    }

    live(): void {
        this.testHelloService!.sayHello();
        this.testGoodbyeService!.sayGoodbye();
    }
}

class TestHeartbeatService extends Service implements OnHeartbeat {
    onHeartbeat(step: number) {
        // print('beat', step);
    }
}

Framework.setup();

Framework.registerServices([
    TestHelloService,
    TestGoodbyeService,
    TestLifeService,
    TestHeartbeatService,
    ColorService,
    TimeService,
    TestService
]);

Framework.registerRemoteFunction(TestFunctionWrapper);
Framework.bindServerSideRemoteFunction<TestFunction>(TestFunctionWrapper);

Framework.registerRemoteFunction(StringCheckFunctionWrapper);
Framework.bindServerSideRemoteFunction<StringCheckFunction>(StringCheckFunctionWrapper);

Framework.registerRemoteFunction(TestClientFunctionWrapper);

Framework.start();

Framework.getService(TestLifeService).live();

new Promise<void>((resolve) => {
    const clientSideFunction = Framework.getClientSideRemoteFunction(TestClientFunctionWrapper);

    print(
        `Client responded by saying: ${clientSideFunction(
            game.GetService('Players').WaitForChild('TheNickmaster21') as Player,
            'hello TestClientFunctionWrapper!'
        )}`
    );
    resolve();
});

export default {};
