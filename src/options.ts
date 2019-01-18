import { RequestMethod } from "./RequestMethod";

export interface RequestMethodOptions {
    method?: RequestMethod;
    uri: string;
    json?: boolean;
    transform?: (body: any, response: any, resolveWithFullResponse: boolean) => any;
}

export interface RequestServiceOptions {
    baseUri: string;
}
