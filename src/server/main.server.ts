import { TestClientFunction } from 'shared/client-side-remote-functions';
import { TestRemoteEvent } from 'shared/remote-events';

import {
    CrochetServer as Crochet, EventDefinition, FunctionDefinition, OnHeartbeat, OnInit, Service
} from '@rbxts/crochet';
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
        this.testHelloService = Crochet.getService(TestHelloService);
        this.testGoodbyeService = Crochet.getService(TestGoodbyeService);
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

Crochet.registerServices([
    TestHelloService,
    TestGoodbyeService,
    TestLifeService,
    TestHeartbeatService,
    ColorService,
    TimeService,
    TestService
]);

Crochet.registerRemoteFunction(TestFunction);
let counter = 0;
Crochet.bindServerSideRemoteFunction(TestFunction, (player: Player, test: string) => {
    print(`${player.Name} said ${test} (${++counter})`);
    return 'reply from TestFunctionWrapper';
});

Crochet.registerRemoteFunction(StringCheckFunction);
Crochet.bindServerSideRemoteFunction(StringCheckFunction, (player: Player, test: string) => {
    return t.string(test);
});

Crochet.registerRemoteFunction(TestClientFunction);

const ServerBindableFunction = new FunctionDefinition<[number, number], number>('ServerBindableFunction');
Crochet.registerBindableFunction(ServerBindableFunction);
Crochet.bindBindableFunction(ServerBindableFunction, (a: number, b: number) => a * b);

const ServerBindableEvent = new EventDefinition<[number]>('SeverBindableEvent');
Crochet.registerBindableEvent(ServerBindableEvent);
Crochet.bindBindableEvent(ServerBindableEvent, (num) => print(num));

Crochet.registerRemoteEvent(TestRemoteEvent);
Crochet.bindRemoteEvent(TestRemoteEvent, (player: Player, str: string, bool: boolean, num: number) => {
    print(player.Name, str, bool, num);
});

Crochet.start();

Crochet.getService(TestLifeService).live();

new Promise<void>((resolve) => {
    const clientSideFunction = Crochet.getClientSideRemoteFunction(TestClientFunction);

    print(
        `Client responded by saying: ${clientSideFunction(
            game.GetService('Players').WaitForChild('TheNickmaster21') as Player,
            'hello TestClientFunctionWrapper!'
        )}`
    );
    resolve();
});

print(`2x4=${Crochet.getBindableFunction(ServerBindableFunction)(2, 4)}`);

const fireServerBindableEvent = Crochet.getBindableEventFunction(ServerBindableEvent);
fireServerBindableEvent(1);
fireServerBindableEvent(6);

const fireRemoteEvent = Crochet.getRemoteEventAllFunction(TestRemoteEvent);
fireRemoteEvent('from server', true, 42);

export default {};
