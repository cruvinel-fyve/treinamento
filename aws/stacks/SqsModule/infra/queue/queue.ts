import { Queue } from "aws-cdk-lib/aws-sqs";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export function makeSimpleQueueService(app: Construct) {
    const resource = new Queue(app, 'sqsRequestLambdaOrders', {
        queueName: 'sqs-request-lambda-orders'
    });

    new StringParameter(app, 'modules.products.sqs.listLambda.orders', {
        parameterName: 'modules.products.sqs.listLambda.orders',
        stringValue: resource.queueName,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });
    return resource;
}