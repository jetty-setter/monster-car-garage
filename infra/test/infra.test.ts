import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { InfraStack } from '../lib/infra-stack';

test('Garage image repository has the expected safeguards', () => {
  // Arrange: create our infrastructure definition locally.
  const app = new cdk.App();
  const stack = new InfraStack(app, 'TestStack');

  // Act: generate its blueprint in memory.
  const template = Template.fromStack(stack);

  // Assert: check what the blueprint contains.
  template.resourceCountIs('AWS::ECR::Repository', 1);

  template.hasResourceProperties('AWS::ECR::Repository', {
    ImageScanningConfiguration: {
      ScanOnPush: true,
    },
  });

  template.hasResource('AWS::ECR::Repository', {
    DeletionPolicy: 'Retain',
    UpdateReplacePolicy: 'Retain',
  });
});