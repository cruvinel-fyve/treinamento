import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ParameterTier, StringParameter, ParameterDataType } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export function makeFullAcessRole(app: Construct) {
    const lambdaRole = new Role(app, 'fullAccessRole2', {
        roleName: 'App@Lambda=FullAccess',
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        description: 'Acesso de administrador',
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
        ],
    });
    new StringParameter(app, 'modules.iam.lambda.full-access2', {
        parameterName: 'modules.iam.lambda.full-access2',
        stringValue: lambdaRole.roleArn,
        dataType: ParameterDataType.TEXT,    // **
        tier: ParameterTier.STANDARD,
    });
};

/*
LEGENDA:
** -> mudanças que fiz do código exemplo para cá que não sei se fica a mesma coisa
*/