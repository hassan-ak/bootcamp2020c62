// We are exporing a handler funtion and when ever handler function is called we need to return some thing
export async function handler(event: any) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${event.path}\n`,
  };
}
