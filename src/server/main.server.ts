import { TestClientFunction } from 'shared/client-side-remote-functions';
import { OnHeartbeat, OnInit, ServerFramework as Framework, Service } from 'shared/framework';

import t from '@rbxts/t';

import { StringCheckFunction, TestFunction } from '../shared/server-side-remote-functions';
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

Framework.registerRemoteFunction(TestFunction);
let counter = 0;
Framework.bindServerSideRemoteFunction(TestFunction, (player: Player, test: string) => {
    print(`${player.Name} said ${test} (${++counter})`);
    return 'reply from TestFunctionWrapper';
});

Framework.registerRemoteFunction(StringCheckFunction);
Framework.bindServerSideRemoteFunction(StringCheckFunction, (player: Player, test: string) => {
    return t.string(test);
});

Framework.registerRemoteFunction(TestClientFunction);

Framework.start();

Framework.getService(TestLifeService).live();

new Promise<void>((resolve) => {
    const clientSideFunction = Framework.getClientSideRemoteFunction(TestClientFunction);

    print(
        `Client responded by saying: ${clientSideFunction(
            game.GetService('Players').WaitForChild('TheNickmaster21') as Player,
            'hello TestClientFunctionWrapper!'
        )}`
    );
    resolve();
});

export default {};
