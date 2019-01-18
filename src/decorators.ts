import "reflect-metadata";
import { RequestMethodOptions, RequestServiceOptions } from "./options";
import { RequestMethod } from "./RequestMethod";
import rp from "request-promise";

const metaDataKey = "restMethods";

export const Request = function (options: RequestMethodOptions | string) {
    return function (target: any, propertyKey: string) {
        let restMethods = Reflect.getMetadata(metaDataKey, target);

        if (typeof options === "string") {
            options = <RequestMethodOptions>{
                uri: options
            };
        }

        if (!restMethods) {
            restMethods = [];
        }

        if (typeof options.json === "undefined") {
            options.json = true;
        }

        if (typeof options.method === "undefined") {
            options.method = RequestMethod.GET;
        }

        restMethods.push({
            key: propertyKey,
            options
        });
        Reflect.defineMetadata(metaDataKey, restMethods, target);
    };
};

export const RequestService = function (options: RequestServiceOptions): ClassDecorator {
    return function (target: any) {
        let restMethods: any[] = Reflect.getMetadata(metaDataKey, target.prototype);

        for (let rq of restMethods) {
            let {options: rqOptions} = rq;

            options.baseUri = options.baseUri.replace(/\/$/, "");
            rqOptions.uri = rqOptions.uri.replace(/^\//, "");

            target.prototype[rq.key] = function (args: any = {}) {
                let queryOptions = {
                    ...rqOptions
                };
                queryOptions.uri = `${options.baseUri}/${queryOptions.uri}`;
                queryOptions.uri = queryOptions.uri.replace(/:(\w+)/, (input: string, argName: any) => {
                    let value = args[argName];
                    delete args[argName];
                    return value;
                });
                queryOptions.formData = args;
                return (<any>rp)(queryOptions).then((res: any) => {
                    if (queryOptions.prepareResult) {
                        res = queryOptions.prepareResult(res);
                    }

                    return res;
                });
            };
        }
    };
};

["get", "post", "put", "delete", "patch", "head", "options"].forEach((method: string) => {
    (<any>Request)[method] = function (options: any) {
        if (typeof options === "string") {
            options = <RequestMethodOptions>{
                uri: options
            };
        }

        options.method = method;
        return Request(options);
    };
});

// ...etc
