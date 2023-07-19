import { Construct } from "constructs";
import { AttributeType, BillingMode, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb"; 
import { ParameterTier, ParameterDataType, StringListParameter, StringParameter } from "aws-cdk-lib/aws-ssm";

export function makeProductsTable(app: Construct) {
    const resource = new Table(app, 'ProductsTable', {
        partitionKey: { name: 'id', type: AttributeType.STRING },
        tableName: 'products-cdk',
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
        billingMode: BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
    });

    new StringParameter(app, 'modules.products.dynamodb.table.products', {
        parameterName: 'modules.dynamodb.tables.products',
        stringValue: resource.tableName,
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
    });
    return resource;
};