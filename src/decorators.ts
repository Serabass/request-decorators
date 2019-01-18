import "reflect-metadata";
import { RequestMethodOptions } from "./RequestMethodOptions";
import { RequestMethod } from "./RequestMethod";
import rp from "request-promise";

export const Request = function (options: RequestMethodOptions | string) {
    return function (target: any, propertyKey: string) {
        let restMethods = Reflect.getMetadata("restMethods", target);

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
        Reflect.defineMetadata("restMethods", restMethods, target);
    };
};

export const RequestService = function (options: any): ClassDecorator {
    return function (target: any) {
        let restMethods: any[] = Reflect.getMetadata("restMethods", target.prototype);

        for (let rq of restMethods) {
            let {options: rqOptions} = rq;

            options.baseUri = options.baseUri.replace(/\/$/, "");
            rqOptions.uri = rqOptions.uri.replace(/^\//, "");

            target.prototype[rq.key] = function (args: any = {}) {
                rqOptions.uri = `${options.baseUri}/${rqOptions.uri}`;
                rqOptions.uri = rqOptions.uri.replace(/:(\w+)/, (input: string, argName: any, pos: number, source: string) => {
                    let value = args[argName];
                    delete args[argName];
                    return value;
                });
                rqOptions.formData = args;
                return (<any>rp)(rqOptions).then((res: any) => {
                    if (rqOptions.prepareResult) {
                        res = rqOptions.prepareResult(res);
                    }

                    return res;
                });
            };
        }
    };
};

["get", "post", "put", "delete", "patch", "head"].forEach((method: string) => {
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
