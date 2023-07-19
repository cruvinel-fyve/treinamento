import { Construct } from "constructs";
import { makeGetProductsApiLambda } from "./api/get/getProducts";
import { makeGetCartApiLambda } from "./api/get/getCart";
import { makeGetProductsByNameApiLambda } from "./api/get/getProductsByName";
import { makePostCartApiLambda } from "./api/post/postCart";
import { makePostOrdersLambda } from "./api/post/postOrders";
import { makeSqsOrdersLambda } from "./sqs/postOrders";

export class GetInfoModuleLambdas extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        makeGetProductsApiLambda(this);
        makeGetCartApiLambda(this);
        makeGetProductsByNameApiLambda(this);
    }
}
export class PostInfoModuleLambdas extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        makePostCartApiLambda(this);
        makePostOrdersLambda(this);
    }
}
export class SqsModuleLambda extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        makeSqsOrdersLambda(this);
    }
}