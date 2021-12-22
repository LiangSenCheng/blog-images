const fs = require("fs");
const path = require("path");
const { CONFIG } = require("./config");

/**
 * 遍历当前目录路径下的文件和目录
 * @param {*} filePath 需要遍历的目录路径
 * @param {*} topPath 第一层目录路径
 * @returns 当前目录路径下的文件列表和目录列表
 */
function fileDisplay(filePath, topPath) {
  // 文件路径列表
  const filePathList = [];
  // 目录列表
  const folderPathList = [];
  //根据文件路径读取文件，返回文件列表
  const files = fs.readdirSync(filePath);
  //遍历读取到的文件列表
  files.forEach((filename) => {
    //获取当前文件的绝对路径
    const filedir = path.join(filePath, filename);
    const pathStr = filedir.replace(topPath, "");
    const relativePath = pathStr.replace(/\\/g, "/");
    //根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = fs.statSync(filedir);
    // 该路径是文件
    if (stats.isFile()) {
      filePathList.push(relativePath);
    }
    // 该路径是文件夹
    if (stats.isDirectory()) {
      folderPathList.push(relativePath);
    }
  });

  return {
    filePathList,
    folderPathList,
  };
}

/**
 * 遍历folderPath路径下的所有文件路径
 * @param {*} folderPath 第一层目录路径,后续生成的相对路径只需将其替换成空字符串
 * @returns 返回folderPath路径下的所有文件路径
 */
function main(folderPath) {
  // 文件路径列表
  let filePathList = [];
  // 目录列表
  let folderPathList = [];
  // 初始化当前正在遍历的目录名
  let curFolderPath = CONFIG.IMG_DIR;

  do {
    if (folderPathList.length > 0) {
      // 更新新的当前正在遍历的目录路径
      curFolderPath = folderPathList.shift();
    }
    //解析需要遍历的文件夹路径
    let filePath = path.resolve(path.join(folderPath, curFolderPath));
    // 遍历结果
    let pathList = fileDisplay(filePath, folderPath);

    filePathList = filePathList.concat(pathList.filePathList);
    folderPathList = folderPathList.concat(pathList.folderPathList);

  } while (folderPathList.length > 0);
  return filePathList;
}

//调用文件遍历方法
module.exports = { fileDisplay: main };
