import {
    CoreFramework, EventDefinition, FRAMEWORK_FOLDER_NAME, FunctionDefinition
} from './framework';

const RunService = game.GetService('RunService');
assert(RunService.IsClient(), 'ClientFramework can only be imported by client side scripts!');

export abstract class Controller {}

type ControllerConstructor = new () => Controller;

class ClientFrameworkImplementation extends CoreFramework {
    private controllers = new Map<string, Controller>();

    public constructor() {
        super();

        this.frameworkFolder = script.Parent?.WaitForChild(FRAMEWORK_FOLDER_NAME) as Folder;
        this.functionFolder = this.frameworkFolder.WaitForChild('Functions') as Folder;
        this.eventFolder = this.frameworkFolder.WaitForChild('Events') as Folder;
    }

    public async started(): Promise<void> {
        return new Promise<void>((resolve) =>
            Promise.spawn(() => {
                script.Parent?.WaitForChild('Setup');
                resolve();
            })
        );
    }

    public registerControllers(controllerConstructors: ControllerConstructor[]): void {
        controllerConstructors.forEach((controllerConstructor) => this.registerController(controllerConstructor));
    }

    public registerController(controllerConstructor: ControllerConstructor): void {
        const controllerKey = tostring(controllerConstructor);
        assert(!this.controllers.has(controllerKey), `Duplicate controller for name ${controllerKey}!`);
        this.controllers.set(tostring(controllerConstructor), new controllerConstructor());
    }

    public getController<S extends ControllerConstructor>(controllerConstructor: S): InstanceType<S> {
        const controllerKey = tostring(controllerConstructor);
        assert(this.controllers.has(controllerKey), `No controller registered for name ${controllerKey}!`);
        return this.controllers.get(controllerKey) as InstanceType<S>;
    }

    public getServerSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (...args: A) => R {
        const remoteFunction = this.fetchFunctionWithDefinition(functionDefinition) as RemoteFunction;
        return ((...args: A) => remoteFunction.InvokeServer(...args)) as (...args: A) => R;
    }

    public getServerSideRemotePromiseFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (...args: A) => Promise<R> {
        const remoteFunction = this.fetchFunctionWithDefinition(functionDefinition) as RemoteFunction;
        return (...args: unknown[]) => {
            return new Promise((resolve) => Promise.spawn(() => resolve(remoteFunction.InvokeServer(...args) as R)));
        };
    }

    public bindClientSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>,
        functionBinding: (...args: A) => R
    ): void {
        const remoteFunction = this.fetchFunctionWithDefinition(functionDefinition) as RemoteFunction;
        remoteFunction.OnClientInvoke = functionBinding as (...args: unknown[]) => unknown;
    }

    public bindRemoteEvent<A extends unknown[]>(
        eventDefinition: EventDefinition<A>,
        functionBinding: (...args: A) => void
    ): RBXScriptConnection {
        const remoteEvent = this.fetchEventWithDefinition(eventDefinition) as RemoteEvent;
        return remoteEvent.OnClientEvent.Connect(functionBinding as (...args: unknown[]) => void);
    }

    public getRemoteEventFunction<A extends unknown[]>(eventDefinition: EventDefinition<A>): (...args: A) => void {
        const remoteEvent = this.fetchEventWithDefinition(eventDefinition) as RemoteEvent;
        return ((...args: A) => remoteEvent.FireServer(...args)) as (...args: A) => void;
    }
}

export const ClientFramework = new ClientFrameworkImplementation();
