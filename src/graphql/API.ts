/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type BedrockResponse = {
  __typename: "BedrockResponse",
  body?: string | null,
  error?: string | null,
};

export type AskBedrockQueryVariables = {
  ingredients?: Array< string | null > | null,
};

export type AskBedrockQuery = {
  askBedrock?:  {
    __typename: "BedrockResponse",
    body?: string | null,
    error?: string | null,
  } | null,
};
