import t from '@rbxts/t';

export interface OnInit {
    onInit(): void;
}

export interface OnHeartbeat {
    onHeartbeat(step: number): void;
}

export abstract class Service {}

type ServiceConstructor = new (...services: Service[]) => Service;

export type ServerSideRemoteFunction<F> = F extends (...args: infer U) => infer R
    ? (player: Player, ...args: U) => R
    : never;

export abstract class ServerSideRemoteFunctionWrapper<F extends Function> {
    abstract apply: ServerSideRemoteFunction<F>;

    abstract typeChecks: t.check<unknown>[];
}

type ServerSideRemoteFunctionWrapperConstructor<F extends Function> = new () => ServerSideRemoteFunctionWrapper<F>;

export type ClientSideRemoteFunction = Function;

export abstract class ClientSideRemoteFunctionWrapper<F extends Function> {
    abstract apply: F;

    abstract typeChecks: t.check<unknown>[];
}

type ClientSideRemoteFunctionWrapperConstructor<F extends Function> = new () => ClientSideRemoteFunctionWrapper<F>;

const FRAMEWORK_FOLDER_NAME = 'Framework';

export class ServerFramework {
    private static frameworkFolder: Folder;
    private static functionFolder: Folder;
    private static services = new Map<string, Service>();

    private constructor() {}

    public static setup(): void {
        this.frameworkFolder = new Instance('Folder');
        this.frameworkFolder.Name = FRAMEWORK_FOLDER_NAME;
        this.functionFolder = new Instance('Folder', this.frameworkFolder);
        this.functionFolder.Name = 'Functions';
    }

    public static registerServices(serviceConstructors: ServiceConstructor[]): void {
        serviceConstructors.forEach((serviceConstructor) => this.registerService(serviceConstructor));
    }

    public static registerService(serviceConstructor: ServiceConstructor): void {
        const serviceKey = tostring(serviceConstructor);
        if (this.services.has(serviceKey)) throw `Duplicate service for name ${serviceKey}!`;
        this.services.set(tostring(serviceConstructor), new serviceConstructor());
    }

    public static getService<S extends ServiceConstructor>(serviceConstructor: S): InstanceType<S> {
        const serviceKey = tostring(serviceConstructor);
        if (!this.services.has(serviceKey)) throw `No service registered for name ${serviceKey}!`;
        return this.services.get(serviceKey) as InstanceType<S>;
    }

    public static registerRemoteFunction<T extends Function>(
        functionConstructor:
            | ServerSideRemoteFunctionWrapperConstructor<T>
            | ClientSideRemoteFunctionWrapperConstructor<T>
    ): void {
        const name = tostring(functionConstructor);
        const remoteFunction = new Instance('RemoteFunction');
        remoteFunction.Name = name;
        remoteFunction.Parent = this.functionFolder;
    }

    public static bindServerSideRemoteFunction<T extends Function>(
        functionConstructor: ServerSideRemoteFunctionWrapperConstructor<T>
    ): void {
        const name = tostring(functionConstructor);
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined)
            throw `Functions must be registered before being bound; not function found for ${name}`;
        const func = new functionConstructor();

        remoteFunction.OnServerInvoke = (player: Player, ...args: unknown[]) => {
            if (args.size() !== func.typeChecks.size()) throw `Wrong number of arguments for function ${name}`;
            func.typeChecks.forEach((tCheck, i) => {
                if (!tCheck(args[i])) throw `Invalid argument for function ${name} at index ${i}`;
            });
            return func.apply(player, ...args);
        };
    }

    public static registerClientSideRemoteFunction<T extends Function>(
        functionConstructor: ClientSideRemoteFunctionWrapperConstructor<T>
    ): void {
        const name = tostring(functionConstructor);
        const remoteFunction = new Instance('RemoteFunction');
        remoteFunction.Name = name;
        remoteFunction.Parent = this.functionFolder;
    }

    public static getClientSideRemoteFunction<T extends ClientSideRemoteFunction>(
        functionConstructor: ClientSideRemoteFunctionWrapperConstructor<T>
    ): ServerSideRemoteFunction<T> {
        const name = tostring(functionConstructor);
        const remoteFunction = this.functionFolder.FindFirstChild(name);
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;
        return (((player: Player, ...args: unknown[]) =>
            (remoteFunction as RemoteFunction).InvokeClient(player, ...args)) as unknown) as ServerSideRemoteFunction<
            T
        >;
    }

    public static start(): void {
        this.services.values().forEach((service) => {
            if ('onInit' in service) {
                (service as OnInit).onInit();
            }
            if ('onHeartbeat' in service) {
                game.GetService('RunService').Heartbeat.Connect((step) => (service as OnHeartbeat).onHeartbeat(step));
            }
        });

        this.frameworkFolder.Parent = script.Parent;
    }
}

export class ClientFramework {
    private static frameworkFolder: Folder;
    private static functionFolder: Folder;
    private constructor() {}

    public static async started(): Promise<void> {
        this.frameworkFolder = script.Parent?.WaitForChild(FRAMEWORK_FOLDER_NAME) as Folder;
        this.functionFolder = this.frameworkFolder.WaitForChild('Functions') as Folder;
    }

    public static getServerSideRemoteFunction<T extends ClientSideRemoteFunction>(
        functionConstructor: ServerSideRemoteFunctionWrapperConstructor<T>
    ): T {
        const name = tostring(functionConstructor);
        const remoteFunction = this.functionFolder.FindFirstChild(name);
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;
        return (((...args: unknown[]) => (remoteFunction as RemoteFunction).InvokeServer(...args)) as unknown) as T;
    }

    public static bindClientSideRemoteFunction<T extends Function>(
        functionConstructor: ClientSideRemoteFunctionWrapperConstructor<T>
    ): void {
        const name = tostring(functionConstructor);
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined)
            throw `Functions must be registered before being bound; not function found for ${name}`;
        const func = new functionConstructor();

        remoteFunction.OnClientInvoke = (...args: unknown[]) => {
            if (args.size() !== func.typeChecks.size()) throw `Wrong number of arguments for function ${name}`;
            func.typeChecks.forEach((tCheck, i) => {
                if (!tCheck(args[i])) throw `Invalid argument for function ${name} at index ${i}`;
            });
            return func.apply(...args);
        };
    }
}
