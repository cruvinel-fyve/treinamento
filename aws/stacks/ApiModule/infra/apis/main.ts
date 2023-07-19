import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { importLambda } from "../../../helpers/import-lambda";

export function makeMainApi(app: Construct) {
    const mainApi = new RestApi(app, 'MainApi', {
        restApiName: 'MainApi',
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
        },
        deploy: true,
    });

    const products = mainApi.root.addResource('products');
    const cart = mainApi.root.addResource('cart');
    const orders = mainApi.root.addResource('orders');
    const productsName = products.addResource('name');

    products.addMethod('GET', new LambdaIntegration(importLambda(app, 'modules.lambda.api.get-products')));
    productsName.addMethod('GET', new LambdaIntegration(importLambda(app, 'modules.lambda.api.get.productsbyname')));
    cart.addMethod('GET', new LambdaIntegration(importLambda(app, 'modules.lambda.api.post-cart')));
    cart.addMethod('POST', new LambdaIntegration(importLambda(app, 'modules.lambda.api.get-cart')));
    orders.addMethod('POST', new LambdaIntegration(importLambda(app, 'modules.lambda.api.sqs-orders')));

}