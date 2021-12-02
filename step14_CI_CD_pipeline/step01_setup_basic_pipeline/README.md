# Setting up a cdk pipline source

In this step we are just setting up a cdk pipline source that will be a connection between our github and aws.

## Steps to code

1. Create a new directory by using `mkdir step01_setup_basic_pipeline`
2. Naviagte to the newly created directory using `cd step01_setup_basic_pipeline`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. We need a github access so genrate a personal token with total control by visting [Personal access tokens](https://github.com/settings/tokens)
6. Go to the AWS secret Manager Console and click on store a new secret. Select Secret type other type of secrets and select plaintext and paste the token in the input. Then add a secret name and it will be used in your cdk code then save.
7. Install code pipeline in the app using `npm i @aws-cdk/aws-codepipeline`
8. Update "lib.step01_setup_basic_pipeline-stack.ts" to define an artifact which is going to store output from a stage1.

   ```js
   import * as codePipeline from "@aws-cdk/aws-codepipeline";
   const sourceOutput = new codePipeline.Artifact();
   ```

9. Update "lib.step01_setup_basic_pipeline-stack.ts" to define pipeline.

   ```js
   const piplin = new codePipeline.Pipeline(this, "CDKPipeLine", {
     crossAccountKeys: false,
     restartExecutionOnUpdate: true,
   });
   ```

10. Install code pipeline action in the app using `npm i @aws-cdk/aws-codepipeline-actions`
11. Update "lib.step01_setup_basic_pipeline-stack.ts" to define source Stage

    ```js
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
    ```

12. Deploy app using `cdk deploy` this will create an error as atleast two stages are required for pipeline deployment
