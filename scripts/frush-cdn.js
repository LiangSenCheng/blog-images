const fs = require("fs");
const path = require("path");
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

const list = [`${CONFIG.SOURCE_URL}/${CONFIG.DATA_DIR}list-${timestampObj.cur}.json`, `${CONFIG.SOURCE_URL}/${CONFIG.DATA_DIR}list-${timestampObj.cur}.txt`, `${CONFIG.SOURCE_URL}/README.md`].concat(pathsList.list);

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
    
    const logPath = path.join(process.cwd(), `${CONFIG.DATA_DIR}/cdn-log.json`);
    // // 删除旧log文件
    // fs.rmSync(logPath, {
    //   force: true,
    //   recursive: true
    // });
    // 添加新log文件
    fs.writeFileSync(logPath, JSON.stringify(result));
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