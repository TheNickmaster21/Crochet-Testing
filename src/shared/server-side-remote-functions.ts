import { FunctionDefinition } from 'shared/framework';

export const TestFunction = new FunctionDefinition<[string], string>('TestFunction');

export const StringCheckFunction = new FunctionDefinition<[string], boolean>('StringCheckFunction');
