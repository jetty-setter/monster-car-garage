#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();

new InfraStack(app, 'InfraStack', {
  stackName: 'MonsterGarage',

  env: {
    account: '936922781601',
    region: 'us-east-1',
  },

  analyticsReporting: false,

  synthesizer: new cdk.DefaultStackSynthesizer({
    cloudFormationExecutionRole:
      'arn:aws:iam::936922781601:role/MonsterGarageCloudFormation',

    // Use the current caller's credentials, not shared bootstrap roles.
    deployRoleArn: '',
    fileAssetPublishingRoleArn: '',
    imageAssetPublishingRoleArn: '',
    lookupRoleArn: '',
    useLookupRoleForStackOperations: false,

    // Keep this project's deployment files under their own prefix.
    bucketPrefix: 'monster-car-garage/',
  }),
});