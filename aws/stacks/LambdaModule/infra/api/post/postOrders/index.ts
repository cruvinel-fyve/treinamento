import { Construct } from "constructs";
import { importRole } from "../../../../../helpers/import-role";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda'
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration, Fn, aws_lambda_event_sources } from "aws-cdk-lib";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Queue } from "aws-cdk-lib/aws-sqs";

export function makePostOrdersLambda(app: Construct) {
    const functionName = 'Main-Api-Orders-postInfo';
    const importedRole = importRole(app, 'PostOrdersLambda', 'App@Lambda=FullAccess');

    // const axiosLayer = new lambda.LayerVersion(app, 'AxiosLayer', {
    //     code: lambda.Code.fromAsset(path.resolve(__dirname, './handler.ts')),
    //     compatibleRuntimes: [lambda.Runtime.NODEJS_16_X, lambda.Runtime.NODEJS_14_X,],
    // });

    const resource = new NodejsFunction(app, functionName, {
        handler: 'handler',
        functionName: functionName,
        role: importedRole as any,
        entry: path.join(__dirname, `/handler.ts`),
        runtime: lambda.Runtime.NODEJS_16_X,
        logRetention: RetentionDays.SIX_MONTHS,
        timeout: Duration.seconds(15),
        // layers: [axiosLayer]
    });

    const queueArn = Fn.importValue('MyQueueArn')

    const queue = Queue.fromQueueArn(app, 'sqs-request-lambda-orders', queueArn)

    resource.addEventSource(new aws_lambda_event_sources.SqsEventSource(queue))

    new StringParameter(app, 'modules.lambda.api.sqs-orders', {
        parameterName: 'modules.lambda.api.sqs-orders',
        stringValue: resource.functionArn,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });

    return resource;
};