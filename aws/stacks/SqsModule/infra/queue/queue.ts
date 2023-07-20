import { CfnOutput } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export function makeSimpleQueueService(app: Construct) {
    const resource = new Queue(app, 'sqsRequestLambdaOrders', {
        queueName: 'sqs-request-lambda-orders'
    });

    new CfnOutput(app, 'QueueArn', {
        value: resource.queueArn,
        exportName: 'MyQueueArn', // Dê um nome para a exportação do ARN da fila
      });

    new StringParameter(app, 'modules.products.sqs.listLambda.orders', {
        parameterName: 'modules.products.sqs.listLambda.orders',
        stringValue: resource.queueName,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });
    return resource;
}