import { AttributeDefinition } from '@rbxts/crochet';
import { t } from '@rbxts/t';

export const SecondName = new AttributeDefinition('SecondName', t.string);

// Attributes for the PromptComponent
export const PromptObjectText = new AttributeDefinition('PromptObjectText', t.string);
export const PromptActionText = new AttributeDefinition('PromptActionText', t.string);

// Attributes for the NumberDisplayComponent
export const NumberProperty = new AttributeDefinition('NumberProperty', t.number);
