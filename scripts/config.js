const CONFIG = {
  GIT_REF: "main", // git.ref, 即本地的分支
  GIT_REMOTE: "origin", // git.remote
  GIT_DIR: "", // .git的目录路径,若SYS_DIR已经包含.git目录,则GIT_DIR设置为空;
  IMG_DIR: "images", // 待遍历文件的目录
  SYS_DIR: "../", // 根目录文件路径 若为空时,默认是执行文件所在目录
  SOURCE_URL: "https://cdn.jsdelivr.net/gh/LiangSenCheng/blog-images",
};

module.exports = { CONFIG };
