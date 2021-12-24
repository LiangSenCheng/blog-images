/**
 * cloudflare Workers脚本
 * 作用: 加速github仓库的 git push/git pull
 * 说明:
 * 1、把本地Git的远程仓库地址换成部署当前 workers脚本的cloudflare域名即可实现国内github加速效果
 */
addEventListener(
	"fetch", event => {
		let url = new URL(event.request.url);
		url.hostname = "github.com";
		url.protocol = "https";
		let request = new Request(url, event.request);
		event.respondWith(
			fetch(request)
		)
	}
)