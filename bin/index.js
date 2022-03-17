#!/usr/bin/env node

const inquirer = require('inquirer');
const packageJson = require('../package.json');
const { checkNodeVersion, checkEnvironmentVariables } = require('../utils/index');
const execSync = require('child_process').execSync;
const { genCIFiles, genJenkinsJob, genGitlabWebhook, genDingtalWebhook } = require('../lib/generate');

const version = packageJson.version;
const requiredNodeVersion = packageJson.engines.node;

checkNodeVersion(requiredNodeVersion, 'ci-cli');

checkEnvironmentVariables(process.env);

let gitlabUrl;
try{
    const remotes = execSync('git remote -v').toString().trim();
    gitlabUrl = remotes.split('\t')[1].split(' ')[0];
} catch{}

const program = require('commander');

program.version(version);

program
    .command('jenkins')
    .description('创建Jenkins多分支流水线任务')
    .action(() => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'gitlabUrl',
                message: '请输入项目的gitlab地址',
                default: gitlabUrl,
                validate(input, answers) {
                    return !!input.trim();
                }
            },
        ]).then(async answers => {
            const { gitlabUrl } = answers;
            await genJenkinsJob(gitlabUrl);
        });
    });

program
    .command('gitlab')
    .description('添加webhooks到gitlab仓库')
    .action(() => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'gitlabUrl',
                message: '请输入项目的gitlab地址',
                default: gitlabUrl,
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'webhook',
                message: '请输入webhook链接',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
        ]).then(async answers => {
            const { gitlabUrl, webhook } = answers;
            await genGitlabWebhook(gitlabUrl, webhook);
        });
    });

program
    .command('script')
    .description('为项目生成CI脚本')
    .action(() => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'projectRoot',
                message: '请输入项目所在位置',
                default: process.cwd(),
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'gitlabUrl',
                message: '请输入项目的gitlab地址',
                default: gitlabUrl,
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'list',
                name: 'lang',
                message: '请选择项目使用的编程语言',
                choices: ['javascript', 'java', 'python'],
                default: 'javascript',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'dingtalkCICDWebhook',
                message: '请输入项目钉钉群CICD机器人的webhook链接',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'phone',
                message: '请输入你钉钉绑定的手机号',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
        ]).then(async answers => {
            const { lang, projectRoot, dingtalkCICDWebhook, gitlabUrl, phone } = answers;
            await genCIFiles(lang, projectRoot, dingtalkCICDWebhook, gitlabUrl, phone);
        });
    });

program
    .command('init')
    .description('自动配置CI流程')
    .action(() => {
        console.log('欢迎使用CI脚手架..');
        inquirer.prompt([
            {
                type: 'input',
                name: 'projectRoot',
                message: '请输入项目所在位置',
                default: process.cwd(),
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'gitlabUrl',
                message: '请输入项目的gitlab地址',
                default: gitlabUrl,
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'list',
                name: 'lang',
                message: '请选择项目使用的编程语言',
                choices: ['javascript', 'java', 'python'],
                default: 'javascript',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'dingtalkGitlabWebhook',
                message: '请输入项目钉钉群Gitlab机器人的webhook链接',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'dingtalkCICDWebhook',
                message: '请输入项目钉钉群CICD机器人的webhook链接',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
            {
                type: 'input',
                name: 'phone',
                message: '请输入你钉钉绑定的手机号',
                validate(input, answers) {
                    return !!input.trim();
                }
            },
        ]).then(async answers => {
            const { lang, projectRoot, dingtalkGitlabWebhook, dingtalkCICDWebhook, gitlabUrl, phone } = answers;
            console.log('正在为你配置CI流程...');
            await genJenkinsJob(gitlabUrl);
            await genDingtalWebhook(gitlabUrl, dingtalkGitlabWebhook);
            await genCIFiles(lang, projectRoot, dingtalkCICDWebhook, gitlabUrl, phone);
            console.log('配置完毕！')
            console.log('*****CI流程*****')
            console.log('提交代码->Gitlab通知->Jenkins打包构建镜像->钉钉群通知')            
        });
    });

const agrs = process.argv.slice(2);

const firstArg = agrs[0];

// 无参数时默认输出help信息
if (!firstArg) {
    program.outputHelp();
}

// 解析参数
program.parse(process.argv);


/*

CI脚手架设计思路：
1.注册命令
  - init(ci_files+hooks+job)
      1.项目所在位置：/users/docuements/project/abc
      2.项目Gitlab仓库地址：http://wuhan.vobile.com:5001/monentization/demo.git
      3.项目使用的编程语言(js/java/python)：js
      4.项目钉钉群webhook(可选)：https://dingtalk.....
      5.你的钉钉手机号：13811616468
  - script(ci_files)
      1.项目所在位置：/users/docuements/project/abc
      2.项目Gitlab仓库地址：http://wuhan.vobile.com:5001/monentization/demo.git
      3.项目使用的编程语言(js/java/python)：js
      4.项目钉钉群webhook(可选)：https://dingtalk.....
      5.你的钉钉手机号：13811616468
  - gitlab(jenkings_hook,dingtalk_hook)
      1.项目Gitlab仓库地址：http://wuhan.vobile.com:5001/monentization/demo.git
      2.项目钉钉群webhook(可选)：https://dingtalk.....
  - jenkins(jenkins_job)
      1.项目Gitlab仓库地址：http://wuhan.vobile.com:5001/monentization/demo.git
  - help
  - version
2.解析参数，校验参数
3.提供模板
4.下载模版
5.根据模板与参数来生成文件
6.错误捕捉与处理
7.友好提示

欢迎使用CI脚手架..
1.项目所在位置：/users/docuements/project/abc
2.项目Gitlab仓库地址：http://wuhan.vobile.com:5001/monentization/demo.git
3.项目使用的编程语言(js/java/python)：js
4.项目钉钉群webhook(可选)：https://dingtalk.....
5.你的钉钉手机号：13811616468
正在为你配置CI流程...
-创建Jenkins任务✅
-添加JenkinsWebhook..✅❌
-添加钉钉群Webhook..✅
-生成Nginx配置文件..✅
-生成conf.prod.Dockerfile..✅
-配置pom.xml..✅
-配置src/main/resources/application.yml..✅
-生成Jenkinsfile..✅
-生成K8sPod.yaml..✅
-生成Dockerfile..✅
配置完毕！
*****CI流程*****
提交代码->Gitlab通知->Jenkins打包构建镜像->钉钉群通知
*/
