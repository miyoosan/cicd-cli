# vcicd-cli

```shell
# install
yarn global add vcicd-cli

cicd --help
----
Usage:  [options] [command]

Options:
  -V, --version  output the version number
  -h, --help     output usage information

Commands:
  jenkins        创建Jenkins多分支流水线任务
  gitlab         添加webhooks到gitlab仓库
  script         为项目生成CI脚本
  init           自动配置CI流程
```

## 使用前，请在本地配置正确的环境变量
```shell
# 示例
# vi ~/.zshrc 
export GITLAB_URL="http://xxxx"
export GITLAB_PRIVATE_TOKEN="xxx"
export GITLAB_CREDENTIALS_ID="xxxxx"
export JENKINS_URL="http://xxx"
export JENKINS_USERNAME="xxx"
export JENKINS_PASSWORD="xxx"

# source ~/.zshrc
```

## 使用帮助


```shel
# 安装工具
brew install node
brew install yarn
yarn global add vcicd-cli
```

```shel
# 升级工具版本
yarn global add vcicd-cli
```

```shel
# 查看工具版本
cicd --version
```

```shel
# 自动创建Jenkins任务、绑定Webhook
# 进入项目根目录
cicd init
```

```shel
# 生成部署清单 (工具版本 >= 0.2.0)
# 进入k8s-vela-config根目录(非master分支)
cicd deploy
```