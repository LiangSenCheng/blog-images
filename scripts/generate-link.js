const fs = require("fs");
const path = require("path");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Shanghai");

const { fileDisplay } = require("./file-dir");

const { CONFIG } = require("./config");

/**
 * 
 * @param {*} rootFolder 
 * @param {*} fileList 
 */
function generateFileStr() {
  return new Date().getTime()
}

/**
 * 更新文件
 */
function updateText(rootFolder, fileList, fileStr) {
  // 文件路径
  const listTxtFilePath = path.join(rootFolder, `list-${fileStr}.txt`);
  const listData = fileList.reverse().map((item) => `${CONFIG.SOURCE_URL}${item}`);

  // 删除旧文件
  fs.rmSync(`${path.join(rootFolder, 'data')}`, { force: true, recursive:true });
  // 更新txt
  fs.writeFileSync(listTxtFilePath, `${listData.join("\n")}`, "utf8");
}

/**
 * 更新json
 */
function updateJson(rootFolder, fileList, fileStr) {
  // 文件路径
  const listJsonFilePath = path.join(rootFolder, `list-${fileStr}.json`);
  const listData = fileList.reverse().map((item) => `${CONFIG.SOURCE_URL}${item}`);
  const listObj = {
    list: listData,
    timestamp: new Date().getTime(),
    updateTime: dayjs().format("YYYY-MM-DD HH:MM:ss"),
  };
  // 删除旧文件
  fs.rmSync(`${path.join(rootFolder, 'data')}`, { force: true, recursive:true });
  fs.writeFileSync(listJsonFilePath, JSON.stringify(listObj));
}

/**
 * 更新readme
 */
function updateReadme(rootFolder, fileStr) {
  // 文件路径
  const readmeFilePath = path.join(rootFolder, "README.md");
  const readmeStr = `# blog-images \n\n* ${CONFIG.SOURCE_URL}/${CONFIG.IMG_DIR}/ \n\n* ${CONFIG.SOURCE_URL}/data/list-${fileStr}.json \n\n* ${CONFIG.SOURCE_URL}/data/list-${fileStr}.txt \n\n${dayjs().format("YYYY-MM-DD HH:MM:ss")}`;
  // 删除旧文件
  fs.rmSync(readmeFilePath, { force: true });
  fs.writeFileSync(readmeFilePath, readmeStr);
}

async function main() {
  // 获取指定目录下的所有文件路径
  const rootFolder = process.cwd();
  // 路径列表
  const fileList = fileDisplay(rootFolder);
  const fileStr = generateFileStr()
  // 更新txt
  updateText(rootFolder, fileList, fileStr);
  // 更新json
  updateJson(rootFolder, fileList, fileStr);
  // 更新readme
  updateReadme(rootFolder, fileStr);
}

main();