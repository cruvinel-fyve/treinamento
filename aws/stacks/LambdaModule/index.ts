import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { GetInfoModuleLambdas, PostInfoModuleLambdas, SqsModuleLambda } from "./infra";

export class LambdaModule extends Stack {
    constructor(app: Construct, name: string, props?: StackProps) {
        super(app, name, props)
        new GetInfoModuleLambdas(this, 'GetInfoModuleLambdas');
        new PostInfoModuleLambdas(this, 'PostInfoModuleLambdas');
        new SqsModuleLambda(this, 'SqsModuleLambda');
    };
};
