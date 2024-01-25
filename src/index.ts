
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { Resend } from 'resend';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const resend = new Resend('re_jYKCWbVe_9E2k4gpqPYXVTbWPxyZQT2hz');

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export  interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if(request.method !== 'POST') {
			return new Response('Please send a POST request!');
		} 
		try {
			const rawBody = await request.text();
		
			if (!checkSignature(rawBody, request.headers, "supersecret")) {
			  return new Response("Wrong password, try again", {status: 403});
			}


			const action = request.headers.get('X-GitHub-Event');
			const json = JSON.parse(rawBody);
			const repoName = json.repository.full_name;
			const senderName = json.sender.login;

			return sendText(`Hello ${senderName} from ${repoName}`, `${senderName} completed ${action} onto your repo ${repoName}`);
		  } catch (e) {
			return new Response(`Error:  ${e}`);
		  }
	},
};
function checkSignature(text, headers, githubSecretToken) {
  const hmac = createHmac('sha256', githubSecretToken);
  hmac.update(text);
  const expectedSignature = hmac.digest('hex');
  const actualSignature = headers.get('x-hub-signature-256');

  const trusted = Buffer.from(`sha256=${expectedSignature}`, 'ascii');
  const untrusted =  Buffer.from(actualSignature, 'ascii');

  return trusted.byteLength === untrusted.byteLength
    && timingSafeEqual(trusted, untrusted);
};


async function sendText(subject,message) {
	const { data, error } = await resend.emails.send({
		from: 'onboarding@resend.dev',
		to: ['codewithnws@gmail.com'],
		subject: subject,
		html: message,
	  });
	
	  if (error) {
		return console.error({ error });
	  }
	
	  console.log({ data });
	return Response.json(result);
  };