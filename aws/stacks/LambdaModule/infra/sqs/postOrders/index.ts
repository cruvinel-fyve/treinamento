import { Construct } from "constructs";
import { importRole } from "../../../../helpers/import-role";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda'
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration, Fn, aws_lambda_event_sources } from "aws-cdk-lib";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Queue } from "aws-cdk-lib/aws-sqs";

export function makeSqsOrdersLambda(app: Construct) {
    const functionName = 'Main-Api-Orders-SqsCall';
    const importedRole = importRole(app, 'SqsOrdersLambda', 'App@Lambda=FullAccess');
    const resource = new NodejsFunction(app, functionName, {
        handler: 'handler',
        functionName: functionName,
        role: importedRole as any,
        entry: path.join(__dirname, `/handler.ts`),
        runtime: lambda.Runtime.NODEJS_16_X,
        logRetention: RetentionDays.SIX_MONTHS,
        timeout: Duration.seconds(15),
    });

    new StringParameter(app, 'modules.lambda.api.call-lambda', {
        parameterName: 'modules.lambda.api.call-lambda',
        stringValue: resource.functionArn,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });

    return resource;
};