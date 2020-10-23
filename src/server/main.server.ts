import { OnHeartbeat, OnInit, ServerFramework as Framework, Service } from 'shared/framework';

import t from '@rbxts/t';

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

let counter = 0;

export type TestFunction = (test: string) => string;

Framework.registerRemoteFunction<TestFunction>(
    'TestFunction',
    (player: Player, test: string) => {
        print(`${player.Name} said ${test} (${++counter})`);
        return 'test from server';
    },
    [t.string]
);

export type StringCheckFunction = (test: string) => boolean;

Framework.registerRemoteFunction<StringCheckFunction>(
    'StringCheckFunction',
    (player: Player, test: string) => {
        return true;
    },
    [t.string]
);

Framework.start();

Framework.getService(TestLifeService).live();

export default {};
