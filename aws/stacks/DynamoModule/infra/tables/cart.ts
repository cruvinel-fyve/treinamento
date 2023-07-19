import { Construct } from "constructs";
import { AttributeType, BillingMode, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { ParameterTier, ParameterDataType, StringParameter } from "aws-cdk-lib/aws-ssm";

export function makeCartTable(app: Construct) {
    const resource = new Table(app, 'CartTable', {
        partitionKey: {name: 'userId', type: AttributeType.STRING},
        sortKey: {name: 'productId', type: AttributeType.STRING},
        tableName: 'cart-cdk',
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
        billingMode: BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true
    });

    new StringParameter(app, 'modules.cart,dynamodb.table.cart', {
        parameterName: 'modules.dynamodb.table.cart',
        stringValue: resource.tableName,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });
};