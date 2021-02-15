import {
    CrochetServer as Crochet,
    EventDefinition,
    FunctionDefinition,
    OnHeartbeat,
    OnInit,
    Service
} from '@rbxts/crochet';
import { StringCheckFunction, TestClientFunction, TestFunction, TestRemoteEvent } from 'shared/remotes';

import { ColorService } from './color.service';
import { TestService } from './test.service';
import { TimeService } from './time.service';
import t from '@rbxts/t';

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

const ServerBindableFunction = new FunctionDefinition<(n1: number, n2: number) => number>(
    'ServerBindableFunction',
    [t.number, t.number],
    t.number
);
Crochet.registerBindableFunction(ServerBindableFunction);
Crochet.bindBindableFunction(ServerBindableFunction, (a: number, b: number) => a * b);
print(`2x4=${Crochet.getBindableFunction(ServerBindableFunction)((2 as unknown) as number, 4)}`);

const ServerBindableEvent = new EventDefinition<[number]>('SeverBindableEvent', [t.numberConstrained(-10, 10)]);
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

const fireServerBindableEvent = Crochet.getBindableEventFunction(ServerBindableEvent);
fireServerBindableEvent(1);
fireServerBindableEvent(6);

const fireRemoteEvent = Crochet.getRemoteEventAllFunction(TestRemoteEvent);
fireRemoteEvent('from server', true, 42);

// These methods rely on the beta attributes feature.
// Make sure the feature is enabled for studio before uncommenting!
// import { SecondName } from 'shared/attributes';
// const testAttributePart = new Instance('Part');
// Crochet.setAttribute(testAttributePart, SecondName, 'TestPartPleaseIngore');
// print(Crochet.getAttribute(testAttributePart, SecondName));
// Crochet.setAttribute(testAttributePart, SecondName, undefined);
// print(Crochet.getAttribute(testAttributePart, SecondName));

export default {};
