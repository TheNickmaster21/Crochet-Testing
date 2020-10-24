export interface OnInit {
    onInit(): void;
}

export interface OnHeartbeat {
    onHeartbeat(step: number): void;
}

export abstract class Service {}

type ServiceConstructor = new (...services: Service[]) => Service;

export class FunctionDefinition<A extends unknown[], R> {
    private static globalId = 0;

    private static getId(): number {
        return ++FunctionDefinition.globalId;
    }

    public functionIdentifier: string;

    constructor(functionIdentifier?: string) {
        if (functionIdentifier === undefined) {
            this.functionIdentifier = tostring(FunctionDefinition.getId());
        } else {
            this.functionIdentifier = functionIdentifier;
        }
    }
}

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

    public static registerRemoteFunction<A extends unknown[], R>(functionDefinition: FunctionDefinition<A, R>): void {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = new Instance('RemoteFunction');
        remoteFunction.Name = name;
        remoteFunction.Parent = this.functionFolder;
    }

    public static bindServerSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>,
        functionBinding: (player: Player, ...args: A) => R
    ): void {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined)
            throw `Functions must be registered before being bound; not function found for ${name}`;

        remoteFunction.OnServerInvoke = functionBinding as (player: Player, ...args: unknown[]) => unknown;
    }

    public static getClientSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (player: Player, ...args: A) => R {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;
        return ((player: Player, ...args: A) => remoteFunction.InvokeClient(player, ...args)) as (
            player: Player,
            ...args: A
        ) => R;
    }

    public static getClientSideRemotePromiseFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (player: Player, ...args: A) => Promise<R> {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;
        return (player: Player, ...args: unknown[]) => {
            return new Promise((resolve) =>
                Promise.spawn(() => resolve(remoteFunction.InvokeClient(player, ...args) as R))
            );
        };
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

    public static getServerSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (...args: A) => R {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;
        return ((...args: A) => remoteFunction.InvokeServer(...args)) as (...args: A) => R;
    }

    public static getServerSideRemotePromiseFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>
    ): (...args: A) => Promise<R> {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;
        return (...args: unknown[]) => {
            return new Promise((resolve) => Promise.spawn(() => resolve(remoteFunction.InvokeServer(...args) as R)));
        };
    }

    public static bindClientSideRemoteFunction<A extends unknown[], R>(
        functionDefinition: FunctionDefinition<A, R>,
        functionBinding: (...args: A) => R
    ): void {
        const name = functionDefinition.functionIdentifier;
        const remoteFunction = this.functionFolder.FindFirstChild(name) as RemoteFunction;
        if (remoteFunction === undefined)
            throw `Functions must be registered before being bound; not function found for ${name}`;

        remoteFunction.OnClientInvoke = functionBinding as (...args: unknown[]) => unknown;
    }
}
