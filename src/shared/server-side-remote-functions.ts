import { FunctionDefinition } from '@rbxts/crochet';

export const TestFunction = new FunctionDefinition<[string], string>('TestFunction');

export const StringCheckFunction = new FunctionDefinition<[string], boolean>('StringCheckFunction');
