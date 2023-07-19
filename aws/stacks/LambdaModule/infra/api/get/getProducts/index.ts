import { Construct } from "constructs";
import { importRole } from "../../../../../helpers/import-role";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda'
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";
import { ParameterDataType, ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";

export function makeGetProductsApiLambda(app: Construct) {
    const functionName = 'Main-Api-Products-getInfo';
    const importedRole = importRole(app, 'GetProductsApiLambda', 'App@Lambda=FullAccess');
    const resource = new NodejsFunction(app, functionName, {
        handler: 'handler',
        functionName: functionName,
        role: importedRole as any,
        entry: path.join(__dirname, `/handler.ts`),
        runtime: lambda.Runtime.NODEJS_16_X,
        logRetention: RetentionDays.SIX_MONTHS,
        timeout: Duration.seconds(15),
    });

    new StringParameter(app, 'modules.lambda.api.get-products', {
        parameterName: 'modules.lambda.api.get-products',
        stringValue: resource.functionArn,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });

    return resource;
};