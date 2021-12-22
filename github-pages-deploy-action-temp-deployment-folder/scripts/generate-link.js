const fs = require("fs");
const path = require("path");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const { fileDisplay } = require("./file-dir");

const { CONFIG } = require("./config");

/**
 * 更新文件
 */
function updateText(rootFolder, fileList) {
  // 文件路径
  const listTxtFilePath = path.join(rootFolder, "list.txt");
  const listData = fileList.reverse().map((item) => `${CONFIG.SOURCE_URL}/${CONFIG.IMG_DIR}${item}`);

  // 删除旧文件
  fs.rmSync(listTxtFilePath, { force: true });
  // 更新txt
  fs.writeFileSync(listTxtFilePath, `${listData.join("\n")}`, "utf8");
}

/**
 * 更新json
 */
function updateJson(rootFolder, fileList) {
  // 文件路径
  const listJsonFilePath = path.join(rootFolder, "list.json");
  const listData = fileList.reverse().map((item) => `${CONFIG.SOURCE_URL}/${CONFIG.IMG_DIR}${item}`);
  const listObj = {
    list: listData,
    timestamp: new Date().getTime(),
    updateTime: dayjs().tz("Asia/Shanghai").format("YYYY-MM-DD HH:MM:ss"),
  };
  // 删除旧文件
  fs.rmSync(listJsonFilePath, { force: true });
  fs.writeFileSync(listJsonFilePath, JSON.stringify(listObj));
}

/**
 * 更新readme
 */
function updateReadme(rootFolder) {
  // 文件路径
  const readmeFilePath = path.join(rootFolder, "README.md");
  const readmeStr = `# blog-images \n\n* ${CONFIG.SOURCE_URL}/${CONFIG.IMG_DIR
    }/ \n\n* ${CONFIG.SOURCE_URL}/list.json \n\n* ${CONFIG.SOURCE_URL
    }/list.txt \n\n${dayjs().tz("Asia/Shanghai").format("YYYY-MM-DD HH:MM:ss")}`;
  // 删除旧文件
  fs.rmSync(readmeFilePath, { force: true });
  fs.writeFileSync(readmeFilePath, readmeStr);
}

async function main() {
  // 获取指定目录下的所有文件路径
  const rootFolder = process.cwd();
  console.log('根目录', rootFolder, process.cwd())
  // 路径列表
  const fileList = fileDisplay(rootFolder);
  console.log('路径列表', fileList);
  // 更新txt
  updateText(rootFolder, fileList);
  // 更新json
  updateJson(rootFolder, fileList);
  // 更新readme
  updateReadme(rootFolder);
}

main();