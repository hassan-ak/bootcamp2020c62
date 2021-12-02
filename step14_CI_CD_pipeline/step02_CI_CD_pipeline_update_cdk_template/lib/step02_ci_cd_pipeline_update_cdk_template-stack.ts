import * as cdk from "@aws-cdk/core";
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
import * as CodeBuild from "@aws-cdk/aws-codebuild";

export class Step02CiCdPipelineUpdateCdkTemplateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Artifacts
    const sourceOutput = new codePipeline.Artifact();
    const CDKOutput = new codePipeline.Artifact();

    // Code Built Action
    const cdkBuild = new CodeBuild.PipelineProject(this, "CdkBuild", {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: 12,
            },
            commands: [
              "cd step14_CI_CD_pipeline",
              "cd step02_CI_CD_pipeline_update_cdk_template",
              "npm install",
            ],
          },
          build: {
            commands: ["npm run build", "npm run cdk synth -- -o dist"],
          },
        },
        artifacts: {
          "base-directory":
            "./step14_CI_CD_pipeline/step02_CI_CD_pipeline_update_cdk_template/dist", ///outputting our generated JSON CloudFormation files to the dist directory
          files: [`${this.stackName}.template.json`],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0, ///BuildImage version 3 because we are using nodejs environment 12
      },
    });

    // Pipeline
    const piplin = new codePipeline.Pipeline(this, "CDKPipeLine", {
      pipelineName: "step14-02-pipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });

    // Adding Stages to pipeline
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
      stageName: "DepolyCDK",
      actions: [
        new CodePipelineAction.CloudFormationCreateUpdateStackAction({
          actionName: "AdministerPipeline",
          templatePath: CDKOutput.atPath(`${this.stackName}.template.json`), ///Input artifact with the CloudFormation template to deploy
          stackName: this.stackName, ///Name of stack
          adminPermissions: true,
        }),
      ],
    });
  }
}
