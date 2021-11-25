import { CrochetServer, EventDefinition, FunctionDefinition, OnHeartbeat, OnInit, Service } from '@rbxts/crochet';
import { NumberProperty, PromptActionText, PromptObjectText } from 'shared/attributes';
import { PromptComponent, PromptTag } from './components/prompt.component';
import { SpinComponent, SpinTag } from './components/spin.component';
import { StringCheckFunction, TestClientFunction, TestFunction, TestRemoteEvent } from 'shared/remotes';

import { ColorService } from './services/color.service';
import { TestService } from './services/test.service';
import { TimeService } from './services/time.service';
import { t } from '@rbxts/t';

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
        this.testHelloService = CrochetServer.getService(TestHelloService);
        this.testGoodbyeService = CrochetServer.getService(TestGoodbyeService);
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

CrochetServer.registerServices([
    TestHelloService,
    TestGoodbyeService,
    TestLifeService,
    TestHeartbeatService,
    ColorService,
    TimeService,
    TestService
]);

CrochetServer.registerTagComponentForTag(SpinComponent, SpinTag);
CrochetServer.registerTagComponents([[PromptComponent, PromptTag]]);

CrochetServer.registerRemoteFunction(TestFunction);
let counter = 0;
CrochetServer.bindServerSideRemoteFunction(TestFunction, (player: Player, test: string) => {
    print(`${player.Name} said ${test} (${++counter})`);
    return 'reply from TestFunctionWrapper';
});

CrochetServer.registerRemoteFunction(StringCheckFunction);
CrochetServer.bindServerSideRemoteFunction(StringCheckFunction, (player: Player, test: string) => {
    return t.string(test);
});

CrochetServer.registerRemoteFunction(TestClientFunction);

const ServerBindableFunction = new FunctionDefinition<(n1: number, n2: number) => number>(
    'ServerBindableFunction',
    [t.number, t.number],
    t.number
);
CrochetServer.registerBindableFunction(ServerBindableFunction);
CrochetServer.bindBindableFunction(ServerBindableFunction, (a: number, b: number) => a * b);
print(`2x4=${CrochetServer.getBindableFunction(ServerBindableFunction)(2 as unknown as number, 4)}`);

const ServerBindableEvent = new EventDefinition<[number]>('SeverBindableEvent', [t.numberConstrained(-10, 10)]);
CrochetServer.registerBindableEvent(ServerBindableEvent);
CrochetServer.bindBindableEvent(ServerBindableEvent, (num) => print(num));

CrochetServer.registerRemoteEvent(TestRemoteEvent);
CrochetServer.bindRemoteEvent(TestRemoteEvent, (player: Player, str: string, bool: boolean, num: number) => {
    print(player.Name, str, bool, num);
});

CrochetServer.start();

CrochetServer.getService(TestLifeService).live();

new Promise<void>((resolve) => {
    // This is deprecated but let's test it anyways
    const clientSideFunction = CrochetServer.getClientSideRemoteFunction(TestClientFunction);

    print(
        `Client responded by saying: ${clientSideFunction(
            game.GetService('Players').WaitForChild('TheNickmaster21') as Player,
            'hello TestClientFunctionWrapper!'
        )}`
    );
    resolve();
});

const fireServerBindableEvent = CrochetServer.getBindableEventFunction(ServerBindableEvent);
fireServerBindableEvent(1);
fireServerBindableEvent(6);

const fireRemoteEvent = CrochetServer.getRemoteEventAllFunction(TestRemoteEvent);
fireRemoteEvent('from server', true, 42);

const CollectionService = game.GetService('CollectionService');

const spinPart = new Instance('Part');
spinPart.Position = new Vector3(10, 20, 10);
spinPart.Parent = game.Workspace;
CollectionService.AddTag(spinPart, SpinTag);
task.spawn(() => {
    wait(10);
    CollectionService.RemoveTag(spinPart, SpinTag);
    print('Removed spin tag');
});

const promptPart = new Instance('Part');
spinPart.Position = new Vector3(-10, 20, 10);
promptPart.Size = new Vector3(4, 4, 4);
promptPart.BrickColor = BrickColor.Green();
promptPart.Parent = game.Workspace;
CrochetServer.setAttribute(promptPart, PromptObjectText, 'Prompt Part');
CrochetServer.setAttribute(promptPart, PromptActionText, 'Interact with');
CollectionService.AddTag(promptPart, PromptTag);

function createNumberDisplayExample(i: number) {
    const part = new Instance('Part');
    CrochetServer.setAttribute(part, NumberProperty, i);
    if (i < 7) {
        part.Position = new Vector3(50, 20, 16 * i - 128);
    } else if (i < 14) {
        part.Position = new Vector3(16 * (i - 7) - 128, 20, 400);
    } else if (i < 21) {
        part.Position = new Vector3(-400, 20, 16 * (i - 14) - 128);
    } else {
        part.Position = new Vector3(16 * (i - 21) - 128, 20, -400);
    }
    part.Anchored = true;
    part.Parent = game.Workspace;

    // TODO This tag value should be in a shared place
    CollectionService.AddTag(part, 'NUMBER_DISPLAY');
}

for (let i = 0; i < 28; i++) {
    createNumberDisplayExample(i);
}

// These methods rely on the beta attributes feature.
// Make sure the feature is enabled for studio before uncommenting!
// import { SecondName } from 'shared/attributes';
// const testAttributePart = new Instance('Part');
// Crochet.setAttribute(testAttributePart, SecondName, 'TestPartPleaseIngore');
// print(Crochet.getAttribute(testAttributePart, SecondName));
// Crochet.setAttribute(testAttributePart, SecondName, undefined);
// print(Crochet.getAttribute(testAttributePart, SecondName));

export default {};
