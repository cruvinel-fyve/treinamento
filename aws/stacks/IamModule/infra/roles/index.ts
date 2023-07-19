import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";
import { makeFullAcessRole } from "./lambda/full-access";

export class RolesModule extends Construct {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);
        makeFullAcessRole(this);
    };
};