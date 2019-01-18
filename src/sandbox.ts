import { RequestService, Request } from "./decorators";
import * as M from "minimatch";

export type RequestAction<I, O> = (opts?: I) => Promise<O>;

@RequestService({
    baseUri: "https://swapi.co/api"
})
export default class MyRequest {

    private static _singleton: MyRequest;

    public static get instance() {
        if (!this._singleton) {
            this._singleton = new MyRequest();
        }

        return this._singleton;
    }

    @Request({
        uri: "/people/:id"
    })
    public execute: RequestAction<{ id: number }, {
        name: string
    }>;
}

MyRequest.instance.execute({id: 2}).then((res) => {
    console.log(res);
});
