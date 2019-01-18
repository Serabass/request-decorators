import { RequestService, Request } from "./decorators";

export type RequestAction<I, O> = (opts?: I) => Promise<O>;

@RequestService({
    baseUri: "https://swapi.co/api"
})
export default class MyRequest {
    @Request({
        uri: "/people/:id"
    })
    public execute: RequestAction<{id: number}, {
        name: string
    }>;
}

(new MyRequest()).execute({id: 2}).then((res: any) => {
    console.log(res);
});
