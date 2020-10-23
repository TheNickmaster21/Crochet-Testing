import t from '@rbxts/t';

export interface OnInit {
    onInit(): void;
}

export interface OnHeartbeat {
    onHeartbeat(step: number): void;
}

export abstract class Service {}

export interface ClientFunctions<T> {
    functions: T;
}

export type ClientFunction<T> = T extends (...args: infer U) => infer R ? (player: Player, ...args: U) => R : never;

type ServiceConstructor = new (...services: Service[]) => Service;

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
        name: string,
        func: ClientFunction<T>,
        tChecks: t.check<unknown>[]
    ): void {
        const remoteFunction = new Instance('RemoteFunction');
        remoteFunction.Name = name;
        remoteFunction.Parent = this.functionFolder;
        remoteFunction.OnServerInvoke = (player: Player, ...args: unknown[]) => {
            if (args.size() !== tChecks.size()) throw `Wrong number of arguments for function ${name}`;
            print(tChecks);
            tChecks.forEach((tCheck, i) => {
                if (!tCheck(args[i])) throw `Invalid argument for function ${name} at index ${i}`;
            });
            return func(player, ...args);
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

    public static getRemoteFunction<T extends Function>(name: string): T {
        const remoteFunction = this.functionFolder.FindFirstChild(name);
        if (remoteFunction === undefined) throw `Could not find function ${name}!`;

        return (((...args: unknown[]) => (remoteFunction as RemoteFunction).InvokeServer(...args)) as unknown) as T;
    }
}
