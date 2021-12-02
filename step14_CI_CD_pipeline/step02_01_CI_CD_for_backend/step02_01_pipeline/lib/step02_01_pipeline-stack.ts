import * as cdk from "@aws-cdk/core";
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
import * as CodeBuild from "@aws-cdk/aws-codebuild";

export class Step0201PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Artifacts
    const sourceOutput = new codePipeline.Artifact();
    const CDKOutput = new codePipeline.Artifact();

    // PipeLine
    const piplin = new codePipeline.Pipeline(this, "CDKPipeLine", {
      pipelineName: "step14-02-01-pipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });

    // Build Function
    const cdkBuild = new CodeBuild.PipelineProject(this, "CdkBuild", {
      projectName: "step14-02-01-build-project",
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: 12,
            },
            commands: [
              "cd step14_CI_CD_pipeline",
              "cd step02_01_CI_CD_for_backend",
              "cd step02_01_backend",
              "npm install",
            ],
          },
          build: {
            commands: ["npm run build", "npm run cdk synth -- -o dist"],
          },
        },
        artifacts: {
          "base-directory":
            "./step14_CI_CD_pipeline/step02_01_CI_CD_for_backend/step02_01_backend/dist",
          files: [`Step0201BackendStack.template.json`],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,
      },
    });

    // Stages for pipeline
    // Source Stage
    piplin.addStage({
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

    // Build Stage
    piplin.addStage({
      stageName: "BuildStage",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "cdkBuild",
          project: cdkBuild,
          input: sourceOutput,
          outputs: [CDKOutput],
        }),
      ],
    });

    // Deploy Stage
    piplin.addStage({
      stageName: "DepolyStage",
      actions: [
        new CodePipelineAction.CloudFormationCreateUpdateStackAction({
          actionName: "AdministerPipeline",
          templatePath: CDKOutput.atPath(`Step0201BackendStack.template.json`), ///Input artifact with the CloudFormation template to deploy
          stackName: "Step0201BackendStack",
          adminPermissions: true,
        }),
      ],
    });
  }
}
