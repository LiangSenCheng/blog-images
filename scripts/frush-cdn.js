const fs = require('fs');
const path = require('path');
const axios = require("axios");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);


const { CONFIG } = require("./config");

/**
 * 检测是否为忽略path/file
 * @param {*} path 
 * @returns 
 */
function ignorePathCheck(path) {
  const ignorePath = [".git", ".github", ".history", "node_modules", "check-file-dir.js", ".lock", ".md", ".gitignore"];
  const res = ignorePath.some(item => {
    return path.includes(item);
  });
  return res;
};

// 执行结果
let result = {
  total: list.length,
  ok: 0, // 成功
  fail: 0, // 失败
  failList: [], // 错误列表
  cdnOriginTime: "",
  formateTime: "",
};

const pathsList = require(`${process.cwd()}/list.json`);
console.log(pathsList)

const list = []

async function frushcdn() {
  if (list.length === 0) {
    result.failList = Array.from(new Set(result.failList));
    result.fail = result.failList.length;
    console.log(result);
    return;
  }
  const filePath = list.shift();
  let state = "";
  try {
    // 上面的请求也可以这样做
    const res = await axios.get(`${CONFIG.SOURCE_URL}${filePath}`, {});
    result.cdnOriginTime = res.data.timestamp;
    result.formateTime = dayjs(res.data.timestamp).tz("Asia/Shanghai").format("YYYY-MM-DD HH:MM:ss");
    if (res.status === 200) {
      if (res.data.status === "finished") {
        result.ok += 1;
        state = "ok";
      } else {
        result.fail += 1;
        state = "err";
        result.failList.push(filePath);
      }
    } else {
      result.fail += 1;
      state = "err";
      result.failList.push(filePath);
    }
  } catch (err) {
    result.fail += 1;
    state = "err";
    result.failList.push(filePath);
    console.log(err);
  } finally {
    console.log("CDN:", filePath, "state:", state);
  }
  // 递归调用刷新CDN方法
  frushcdn();
}

// 开始执行脚本
// frushcdn();
