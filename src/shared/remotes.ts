import { FunctionDefinition } from '@rbxts/crochet';

export const TestClientFunction = new FunctionDefinition<(param: string) => string>('TestClientFunction');

export const TestFunction = new FunctionDefinition<(param: string) => string>('TestFunction');

export const StringCheckFunction = new FunctionDefinition<(param: string) => boolean>('StringCheckFunction');
