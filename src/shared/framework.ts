export interface OnInit {
    onInit(): void;
}

export interface OnHeartbeat {
    onHeartbeat(step: number): void;
}

export class FunctionDefinition<A extends unknown[], R> {
    private static functionDefinitionNames = new Set<string>();

    constructor(public functionIdentifier: string) {
        assert(
            !FunctionDefinition.functionDefinitionNames.has(functionIdentifier),
            `There is already a function defined with the identifier: ${functionIdentifier}`
        );
        FunctionDefinition.functionDefinitionNames.add(functionIdentifier);
    }
}

export class EventDefinition<A extends unknown[]> {
    private static eventDefinitionNames = new Set<string>();

    constructor(public eventIdentifier: string) {
        assert(
            !EventDefinition.eventDefinitionNames.has(eventIdentifier),
            `There is already an event defined with the identifier: ${eventIdentifier}`
        );
        EventDefinition.eventDefinitionNames.add(eventIdentifier);
    }
}

export const FRAMEWORK_FOLDER_NAME = 'Framework';

export abstract class CoreFramework {
    protected frameworkFolder?: Folder;
    protected functionFolder?: Folder;
    protected eventFolder?: Folder;

    public registerBindableFunction<A extends unknown[], R>(functionDefinition: FunctionDefinition<A, R>): void {
        const name = functionDefinition.functionIdentifier;
        assert(this.functionFolder?.FindFirstChild(name) === undefined, `Duplicate function for name ${name}!`);
        const bindableFunction = new Instance('BindableFunction');
        bindableFunction.Name = name;
        bindableFunction.Parent = this.functionFolder;
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
        const func = this.functionFolder?.FindFirstChild(name);
        assert(func !== undefined, `Could not find function with identifier ${name}!`);
        return func as RemoteFunction | BindableFunction;
    }

    public registerBindableEvent<A extends unknown[]>(eventDefinition: EventDefinition<A>): void {
        const name = eventDefinition.eventIdentifier;
        const bindableEvent = new Instance('BindableEvent');
        bindableEvent.Name = name;
        bindableEvent.Parent = this.eventFolder;
    }

    public bindBindableEvent<A extends unknown[]>(
        eventDefinition: EventDefinition<A>,
        functionBinding: (...args: A) => void
    ): RBXScriptConnection {
        const bindableEvent = this.fetchEventWithDefinition(eventDefinition) as BindableEvent;
        return bindableEvent.Event.Connect(functionBinding);
    }

    public getBindableEventFunction<A extends unknown[]>(eventDefinition: EventDefinition<A>): (...args: A) => void {
        const bindableEvent = this.fetchEventWithDefinition(eventDefinition) as BindableEvent;
        return ((...args: A) => bindableEvent.Fire(...args)) as (...args: A) => void;
    }

    protected fetchEventWithDefinition(eventDefinition: EventDefinition<unknown[]>): RemoteEvent | BindableEvent {
        const name = eventDefinition.eventIdentifier;
        const event = this.eventFolder?.FindFirstChild(name);
        assert(event !== undefined, `Could not find event with identifier ${name}!`);
        return event as RemoteEvent | BindableEvent;
    }
}
