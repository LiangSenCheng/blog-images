const fs = require("fs");
const path = require("path");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Shanghai");

const {
  fileDisplay
} = require("./file-dir");

const {
  CONFIG
} = require("./config");

/**
 * 脚本执行时间戳记录
 * @param {*} rootFolder 
 * @param {*} fileList 
 */
function generateFileStr(rootFolder) {
  const timestamp = new Date().getTime();
  const filePath = path.join(rootFolder, `${CONFIG.DATA_DIR}/timestamp.json`);
  const {
    pre,
    cur
  } = require(filePath);
  const newTimestamp = {
    pre: cur ? cur : timestamp,
    cur: timestamp
  }
  fs.writeFileSync(filePath, JSON.stringify(newTimestamp));
  return newTimestamp
}

/**
 * 更新txt文件
 */
function updateText(rootFolder, fileList, timestampObj) {
  // 旧文件路径
  const oldFilePath = path.join(rootFolder, `${CONFIG.DATA_DIR}/list-${timestampObj.pre}.txt`);
  // 新文件路径
  const newFilePath = path.join(rootFolder, `${CONFIG.DATA_DIR}/list-${timestampObj.cur}.txt`);
  const listData = fileList.reverse().map((item) => `${CONFIG.JD_SOURCE_URL}${item}`);

  // 删除旧文件
  fs.rmSync(oldFilePath, {
    force: true,
    recursive: true
  });
  // 添加新txt文件
  fs.writeFileSync(newFilePath, `${listData.join("\n")}`, "utf8");
}

/**
 * 更新json
 */
function updateJson(rootFolder, fileList, timestampObj) {
  // 旧文件路径
  const oldFilePath = path.join(rootFolder, `${CONFIG.DATA_DIR}/list-${timestampObj.pre}.json`);
  // 新文件路径
  const newFilePath = path.join(rootFolder, `${CONFIG.DATA_DIR}/list-${timestampObj.cur}.json`);

  const listData = fileList.reverse().map((item) => `${CONFIG.JD_SOURCE_URL}${item}`);
  const listObj = {
    list: listData,
    timestamp: new Date().getTime(),
    updateTime: dayjs().format("YYYY-MM-DD HH:MM:ss"),
  };
  // 删除旧文件
  fs.rmSync(oldFilePath, {
    force: true,
    recursive: true
  });
  fs.writeFileSync(newFilePath, JSON.stringify(listObj));
}

/**
 * 更新cloudflare链接的json
 */
 function updateCloudflareJson(rootFolder, fileList) {
  // 文件路径
  const filePath = path.join(rootFolder, `${CONFIG.DATA_DIR}/cloudflare-list.json`);

  const listData = fileList.reverse().map((item) => `${CONFIG.CL_SOURCE_URL}${item}`);
  const listObj = {
    list: listData,
    timestamp: new Date().getTime(),
    updateTime: dayjs().format("YYYY-MM-DD HH:MM:ss"),
  };
  // 删除旧文件
  fs.rmSync(filePath, {
    force: true,
    recursive: true
  });
  fs.writeFileSync(filePath, JSON.stringify(listObj));
}

/**
 * 更新readme
 */
function updateReadme(rootFolder, timestampObj) {
  // 文件路径
  const readmeFilePath = path.join(rootFolder, "README.md");
  const readmeStr = `# blog-images \n\n* ${CONFIG.JD_SOURCE_URL}/${CONFIG.IMG_DIR}/ \n\n* ${CONFIG.JD_SOURCE_URL}/${CONFIG.DATA_DIR}/list-${timestampObj.cur}.json \n\n* ${CONFIG.JD_SOURCE_URL}/${CONFIG.DATA_DIR}/list-${timestampObj.cur}.txt \n\n* ${CONFIG.CL_SOURCE_URL}/${CONFIG.DATA_DIR}/cloudflare-list.json \n\n${dayjs().format("YYYY-MM-DD HH:MM:ss")}`;
  // 删除旧文件
  fs.rmSync(readmeFilePath, {
    force: true
  });
  fs.writeFileSync(readmeFilePath, readmeStr);
}

async function main() {
  // 获取指定目录下的所有文件路径
  const rootFolder = process.cwd();
  // 路径列表
  const fileList = fileDisplay(rootFolder);
  const timestampObj = generateFileStr(rootFolder)
  // 更新txt
  updateText(rootFolder, fileList, timestampObj);
  // 更新json
  updateJson(rootFolder, fileList, timestampObj);
  // 更新cloudflare链接的json
  updateCloudflareJson(rootFolder, fileList);
  // 更新readme
  updateReadme(rootFolder, timestampObj);
}

main();