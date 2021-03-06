const axios = require("axios");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const {
  CONFIG
} = require("./config");


const timestampObj = require(`${process.cwd()}/${CONFIG.DATA_DIR}/timestamp.json`);

const pathsList = require(`${process.cwd()}/${CONFIG.DATA_DIR}/list-${timestampObj.cur}.json`);

const list = [`${CONFIG.JD_SOURCE_URL}/${CONFIG.DATA_DIR}/list-${timestampObj.cur}.json`, `${CONFIG.JD_SOURCE_URL}/${CONFIG.DATA_DIR}/list-${timestampObj.cur}.txt`, `${CONFIG.JD_SOURCE_URL}/${CONFIG.DATA_DIR}/cloudflare-list.json`, `${CONFIG.JD_SOURCE_URL}/README.md`].concat(pathsList.list);

console.log(list)

// 执行结果
let result = {
  total: list.length,
  ok: 0, // 成功
  fail: 0, // 失败
  failList: [], // 错误列表
  cdnOriginTime: "",
  formateTime: "",
};

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
    const res = await axios.get(`${CONFIG.FRUSH_CDN_URL}${filePath}`, {});
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
frushcdn();