#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApisModule, DynamoModule, IamModule, LambdaModule } from '../stacks';

const env = {};

const app = new cdk.App();

new IamModule(app, 'iamStack', env);
new DynamoModule(app, 'DynamoStack', env);
new LambdaModule(app, 'LambdaStack', env)
new ApisModule(app, 'ApisStack', env);