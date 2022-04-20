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
  init           为项目自动配置CI流程
  deploy         创建项目部署清单, 请务必进入k8s-vela-config根目录(非master分支), 再执行此命令
  jenkins        为项目创建Jenkins多分支流水线任务
  gitlab         添加webhooks到gitlab项目仓库
  script         为项目生成CI脚本
```

## 特别说明
- 本项目CI流程适用场景：GitOps模式下Jenkins+Gitlab+Kubernetes搭建起来的CI环境
  - CI流程：提交代码->Gitlab通知->Jenkins打包构建镜像->钉钉群通知
- 本项目CD流程适用场景：GitOps模式下Gitlab+Kubernetes+Kubevela搭建起来的CD环境
  - CD流程：根据项目需要修改生成的文件 -> 提交当前分支到Gitlab -> 提交合并到master的MergeRequest请求 -> 联系运维进行评审、部署
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
# 自动创建Jenkins任务、绑定Webhook、生成CI配置文件
# 进入项目根目录
cicd init
```

```shel
# 生成部署清单 (工具版本 >= 0.3.0)
# 进入k8s-vela-config根目录(非master分支)
cicd deploy
```

## 单独使用某项功能
```shel
# 自动创建Jenkins任务
# 进入项目根目录
cicd jenkins
```

```shel
# 为Gitlab项目绑定Webhook
# 进入项目根目录
cicd gitlab
```

```shel
# 生成CI配置文件
# 进入项目根目录
cicd script
```