/**
 * cloudflare Workers脚本
 * 作用：加速访问github仓库静态资源,其作用类似JsDeliver
 * 优点: 
 * 1、不需要考虑JsDeliver的CDN缓存问题,每次请求都可以读取最新资源;
 * 2、
 * 注：
 * 1、github仓库文件原始链接: https://raw.githubusercontent.com/用户名/仓库名/分支名/文件地址(相对仓库根目录)
 */

// ********************* 配置区 ***************************************
// github 用户名
const defaultUser = "LiangSenCheng";
// github 仓库名
const defaultRepository = "blog-images";
// github 分支名, 配置为master和main效果等同
const defaultMaster = "master";
// 当前cloudflare workers脚本对应的域名
const hostName = "https://gh-file.lx164.workers.dev/";
// ********************************************************************

/**
 * Workers请求监听
 * @param u 用户名[可选]
 * @param repo 仓库名[可选]
 * @param branch 分支名[可选]
 */
addEventListener("fetch", event => {
  const {
    url
  } = event.request;
  const pathName = (url.replace(hostName, "")).split("?")[0];
  const ghUserName = getQueryString(url, "u") || defaultUser;
  const repository = getQueryString(url, "repo") || defaultRepository;
  const master = getQueryString(url, "branch") || defaultMaster;
  const link = `https://raw.githubusercontent.com/${ghUserName}/${repository}/${master}/${pathName}`;
  // 调用 Workers响应处理方法
  return event.respondWith(handleRequest(link));
})

/**
 *  Workers响应处理方法
 */
async function handleRequest(link) {
  var lastChar = link.substring(link.length - 1);
  if (lastChar.indexOf("/") >= 0) {
    return new Response("PATH ERROR", {
      status: 200
    });
  }
  const init = {
    headers: {
      "content-type": "application/octet-stream",
    },
  }
  // 请求github文件
  const response = await fetch(link, init);
  // 自定义响应内容
  const results = await gatherResponse(response);
  // Response
  return new Response(results, init);
}

/**
 * 自定义响应内容
 */
async function gatherResponse(response) {
  const {
    status,
    headers
  } = response;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json());
  } else if (contentType.includes("application/text")) {
    return response.text();
  } else if (contentType.includes("text/html")) {
    return response.text();
  } else {
    return response.blob();
  }
}

/**
 * 获取URL GET请求参数
 */
function getQueryString(url, key) {
  const queryData = url.split("?")[1] || "";
  const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
  const r = queryData.match(reg);
  if (r != null) {
    return unescape(r[2]);
  } else {
    return null;
  }
}