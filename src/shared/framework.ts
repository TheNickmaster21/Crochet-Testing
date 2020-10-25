export interface OnInit {
    onInit(): void;
}

export interface OnHeartbeat {
    onHeartbeat(step: number): void;
}

export abstract class Service {}

type ServiceConstructor = new () => Service;

export abstract class Controller {}

type ControllerConstructor = new () => Controller;

export class FunctionDefinition<A extends unknown[], R> {
    private static functionDefinitionNames = new Set<string>();

    constructor(public functionIdentifier: string) {
        if (FunctionDefinition.functionDefinitionNames.has(functionIdentifier)) {
            throw `There is already a function defined with the identifier: ${functionIdentifier}`;
        }
        FunctionDefinition.functionDefinitionNames.add(functionIdentifier);
    }
}

const FRAMEWORK_FOLDER_NAME = 'Framework';

export abstract class CoreFramework {
    protected frameworkFolder?: Folder;
    protected functionFolder?: Folder;

    public registerBindableFunction<A extends unknown[], R>(functionDefinition: FunctionDefinition<A, R>): void {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = new Instance('BindableFunction');
        remoteFunction.Name = name;
        remoteFunction.Parent = this.functionFolder;
    }

    public bindBindableFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>,
        functionBinding: (...args: A) => R
    ): void {
        const bindableFunction = this.fetchFunctionWithDefinition(functionDefinition) as BindableFunction;
        bindableFunction.OnInvoke = functionBinding as (...args: unknown[]) => unknown;
    }

    public getBindableFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (...args: A) => R {
        const bindableFunction = this.fetchFunctionWithDefinition(functionDefinition) as BindableFunction;
        return ((...args: A) => bindableFunction.Invoke(...args)) as (...args: A) => R;
    }

    protected fetchFunctionWithDefinition(
        functionDefinition: FunctionDefinition<unknown[], unknown>
    ): RemoteFunction | BindableFunction {
        const name = functionDefinition.functionIdentifier;
        const func = this.functionFolder!.FindFirstChild(name);
        if (func === undefined) throw `Could not find function with identifier ${name}!`;
        return func as RemoteFunction | BindableFunction;
    }
}

class ServerFrameworkImpl extends CoreFramework {
    private services = new Map<string, Service>();

    public constructor() {
        super();

        this.frameworkFolder = new Instance('Folder');
        this.frameworkFolder.Name = FRAMEWORK_FOLDER_NAME;
        this.functionFolder = new Instance('Folder', this.frameworkFolder);
        this.functionFolder.Name = 'Functions';
    }

    public setup(): void {
        const setup = new Instance('BoolValue');
        setup.Name = 'Setup';
        setup.Parent = script.Parent;
    }

    public registerServices(serviceConstructors: ServiceConstructor[]): void {
        serviceConstructors.forEach((serviceConstructor) => this.registerService(serviceConstructor));
    }

    public registerService(serviceConstructor: ServiceConstructor): void {
        const serviceKey = tostring(serviceConstructor);
        if (this.services.has(serviceKey)) throw `Duplicate service for name ${serviceKey}!`;
        this.services.set(tostring(serviceConstructor), new serviceConstructor());
    }

    public getService<S extends ServiceConstructor>(serviceConstructor: S): InstanceType<S> {
        const serviceKey = tostring(serviceConstructor);
        if (!this.services.has(serviceKey)) throw `No service registered for name ${serviceKey}!`;
        return this.services.get(serviceKey) as InstanceType<S>;
    }

    public registerRemoteFunction<A extends unknown[], R>(functionDefinition: FunctionDefinition<A, R>): void {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = new Instance('RemoteFunction');
        remoteFunction.Name = name;
        remoteFunction.Parent = this.functionFolder;
    }

    public bindServerSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>,
        functionBinding: (player: Player, ...args: A) => R
    ): void {
        const remoteFunction = this.fetchFunctionWithDefinition(functionDefinition) as RemoteFunction;
        remoteFunction.OnServerInvoke = functionBinding as (player: Player, ...args: unknown[]) => unknown;
    }

    public getClientSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (player: Player, ...args: A) => R {
        const remoteFunction = this.fetchFunctionWithDefinition(functionDefinition) as RemoteFunction;
        return ((player: Player, ...args: A) => remoteFunction.InvokeClient(player, ...args)) as (
            player: Player,
            ...args: A
        ) => R;
    }

    public getClientSideRemotePromiseFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (player: Player, ...args: A) => Promise<R> {
        const remoteFunction = this.fetchFunctionWithDefinition(functionDefinition) as RemoteFunction;
        return (player: Player, ...args: unknown[]) => {
            return new Promise((resolve) =>
                Promise.spawn(() => resolve(remoteFunction.InvokeClient(player, ...args) as R))
            );
        };
    }

    public start(): void {
        this.services.values().forEach((service) => {
            if ('onInit' in service) {
                (service as OnInit).onInit();
            }
            if ('onHeartbeat' in service) {
                game.GetService('RunService').Heartbeat.Connect((step) => (service as OnHeartbeat).onHeartbeat(step));
            }
        });

        this.frameworkFolder!.Parent = script.Parent;
    }
}

class ClientFrameworkImpl extends CoreFramework {
    private controllers = new Map<string, Controller>();

    public constructor() {
        super();

        this.frameworkFolder = script.Parent?.WaitForChild(FRAMEWORK_FOLDER_NAME) as Folder;
        this.functionFolder = this.frameworkFolder.WaitForChild('Functions') as Folder;
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
        if (this.controllers.has(controllerKey)) throw `Duplicate controller for name ${controllerKey}!`;
        this.controllers.set(tostring(controllerConstructor), new controllerConstructor());
    }

    public getController<S extends ControllerConstructor>(controllerConstructor: S): InstanceType<S> {
        const controllerKey = tostring(controllerConstructor);
        if (!this.controllers.has(controllerKey)) throw `No controller registered for name ${controllerKey}!`;
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
}

const RunService = game.GetService('RunService');

export const ServerFramework = RunService.IsServer()
    ? new ServerFrameworkImpl()
    : ((undefined as unknown) as ServerFrameworkImpl);

export const ClientFramework = RunService.IsClient()
    ? new ClientFrameworkImpl()
    : ((undefined as unknown) as ClientFrameworkImpl);
