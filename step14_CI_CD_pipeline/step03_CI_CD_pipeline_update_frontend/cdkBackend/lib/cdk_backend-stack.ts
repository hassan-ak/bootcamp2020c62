import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origions from "@aws-cdk/aws-cloudfront-origins";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
import * as CodeBuild from "@aws-cdk/aws-codebuild";
import { PolicyStatement } from "@aws-cdk/aws-iam";

export class CdkBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Deploy Gatsby on S3 bucket
    // create new bucket
    const myBucket = new s3.Bucket(this, "GatsbyBucket", {
      bucketName: "GatsbyBucket",
      versioned: true,
      websiteIndexDocument: "index.html",
    });
    // create Cloudfront distribution
    const dist = new cloudfront.Distribution(this, "GatsbyDistribution", {
      defaultBehavior: { origin: new origions.S3Origin(myBucket) },
    });
    // create s3 deployment bundle
    new s3Deployment.BucketDeployment(this, "DeployGatsbyWebsite", {
      sources: [s3Deployment.Source.asset("../gatsbyfrontend/public")],
      destinationBucket: myBucket,
      distribution: dist,
    });

    // URL Ouput on Display
    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: dist.domainName,
    });

    // Artifacts
    const sourceOutput = new CodePipeline.Artifact();
    const S3Output = new CodePipeline.Artifact();

    // Build Function
    const s3Build = new CodeBuild.PipelineProject(this, "s3Build", {
      projectName: "step14-03-build-project",
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: 12,
            },
            commands: [
              "cd step14_CI_CD_pipeline",
              "cd step03_CI_CD_pipeline_update_frontend",
              "cd gatsbyfrontend",
              "npm i -g gatsby",
              "npm install",
            ],
          },
          build: {
            commands: ["gatsby build"],
          },
        },
        artifacts: {
          "base-directory":
            "./step14_CI_CD_pipeline/step03_CI_CD_pipeline_update_frontend/gatsbyfrontend/public",
          files: [`**/*`],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,
      },
    });

    // Policy and role creation and assignment
    const policy = new PolicyStatement();
    policy.addActions("s3:*");
    policy.addResources("*");
    s3Build.addToRolePolicy(policy);

    // Pipeline
    // Create Pipeline
    const pipeline = new CodePipeline.Pipeline(this, "GtasbyPipeline", {
      pipelineName: "step14-03-pipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });

    // Stages
    // FirstStage
    pipeline.addStage({
      stageName: "SourceStage",
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: "Checkout",
          owner: "hassan-ak",
          repo: "bootcamp2020c62",
          oauthToken: cdk.SecretValue.secretsManager("Github-Personal-Secret"),
          output: sourceOutput,
          branch: "main",
        }),
      ],
    });
    // Second Stage
    pipeline.addStage({
      stageName: "BuildStage",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "s3Build",
          project: s3Build,
          input: sourceOutput,
          outputs: [S3Output],
        }),
      ],
    });
    // Third Stage
    pipeline.addStage({
      stageName: "DepolyStage",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "s3Build",
          input: S3Output,
          bucket: myBucket,
        }),
      ],
    });
  }
}
