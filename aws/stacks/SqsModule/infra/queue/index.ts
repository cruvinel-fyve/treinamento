import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { makeSqsOrdersLambda } from "../../../LambdaModule/infra/sqs/postOrders";
import { makeSimpleQueueService } from "./queue";

export class SqsModule extends Construct {
    constructor(scope: Construct, id: string, props?: StackProps){
        super(scope, id);
        makeSimpleQueueService(this);
    };
};