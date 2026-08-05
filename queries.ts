/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const askBedrock = /* GraphQL */ `query AskBedrock($ingredients: [String]) {
  askBedrock(ingredients: $ingredients) {
    body
    error
    __typename
  }
}
` as GeneratedQuery<
  APITypes.AskBedrockQueryVariables,
  APITypes.AskBedrockQuery
>;
