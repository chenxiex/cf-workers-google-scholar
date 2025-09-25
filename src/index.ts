/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


const GOOGLE_SCHOLAR = 'https://scholar.google.com';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// 构建目标 URL
		const url = new URL(request.url);
		const targetUrl = GOOGLE_SCHOLAR + url.pathname + (url.search || '');

		// 构建新的请求
		const newRequest = new Request(targetUrl, {
			method: request.method,
			headers: request.headers,
			body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
			redirect: 'follow',
		});

		// 发起请求
		const response = await fetch(newRequest);

		// 复制响应头，去除不允许的头部
		const headers = new Headers(response.headers);
		headers.delete('content-security-policy');
		headers.delete('x-frame-options');

		// 添加 CORS 头部，允许浏览器前端访问
		headers.set('Access-Control-Allow-Origin', '*');
		headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

		// 处理预检请求（OPTIONS）
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers,
			});
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	},
} satisfies ExportedHandler<Env>;
