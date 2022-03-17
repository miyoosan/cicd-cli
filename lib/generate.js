const path = require('path');
const fs = require('fs-extra');
const { underlineLog, successLog, errorLog } = require('../utils/index');
const { createJenkinsJob, addWebhookToGitlab } = require('./addon');
const ora = require('ora');

const getProjectName = (gitlabUrl) => {
    const reg = /[\/][0-9a-zA-Z\-\_]+/g;
    return gitlabUrl.match(reg).pop().slice(1).replace(/_/g, '-');
}
const getProjectPath = (gitlabUrl) => {
    const reg = /[\/][0-9a-zA-Z\-\_]+/g;
    return gitlabUrl.match(reg).slice(-2).join('').slice(1);
}

async function genJenkinsJob(gitlabUrl) {
  const jenkinsUrl = process.env.JENKINS_URL;
  const username = process.env.JENKINS_USERNAME;
  const password = process.env.JENKINS_PASSWORD;
  const jobName = getProjectName(gitlabUrl);
  const spinner = ora('正在创建Jenkins任务..');
  spinner.start();
  const { success, message } = await createJenkinsJob({ jobName, gitRepositoryUrl: gitlabUrl, jenkinsUrl, username, password });
  spinner.stop();
  if (success) {
      successLog(`- 创建Jenkins任务✅ ${message}`);
  } else {
      errorLog(`- 创建Jenkins任务❌ => ${message}`);
  }
  const projectPath = getProjectPath(gitlabUrl);
  const jenkinsWebhook = `${jenkinsUrl}/multibranch-webhook-trigger/invoke?token=${jobName}`;
  const retJenkins = await addWebhookToGitlab({ webhook: jenkinsWebhook, projectPath });
  if (retJenkins.success) {
      successLog('- 添加Jenkins的Webhook✅');
  } else {
      errorLog(`- 添加Jenkins的Webhook❌ => ${retJenkins.message}`);
  }
}

async function genGitlabWebhook(gitlabUrl, webhook) {
  const projectPath = getProjectPath(gitlabUrl);
  const { success, message } = await addWebhookToGitlab({ webhook, projectPath });
  if (success) {
      successLog('- 添加Webhook✅');
  } else {
      errorLog(`- 添加Webhook❌ => ${message}`);
  }
}

async function genDingtalWebhook(gitlabUrl, dingtalkGitlabWebhook) {
  const projectPath = getProjectPath(gitlabUrl);
  const { success, message } = await addWebhookToGitlab({ webhook: dingtalkGitlabWebhook, projectPath });
  if (success) {
      successLog('- 添加钉钉群Gitlab机器人的Webhook✅');
  } else {
      errorLog(`- 添加钉钉群Gitlab机器人的Webhook❌ => ${message}`);
  }
}

async function genCIFiles(lang, projectRoot, dingtalkCICDWebhook, gitlabUrl, phone) {
  const jobName = getProjectName(gitlabUrl);
  const copyTemplates = (lang) => {
      const src = path.resolve(__dirname, `../templates/${lang}`);
      const dest = projectRoot;
      fs.copySync(src, dest, { recursive: true, overwrite: true });
  }
  const updateJenkinsfile = (dest, dingtalkCICDWebhook, jobName, phone) => {
      const imageRepository = `vobile-cn/${jobName}`;
      const jenkinsfile = dest + '/Jenkinsfile';
      let temp = fs.readFileSync(jenkinsfile, { encoding: 'utf8' });
      temp = temp.replace('$DINGTALK_WEBHOOK', dingtalkCICDWebhook);
      temp = temp.replace('$IMAGE_REPOSITORY', imageRepository);
      temp = temp.replace('$PHONE', phone);
      fs.writeFileSync(jenkinsfile, temp);
  }
  try {
    copyTemplates(lang);
    successLog(`- 生成K8sPod.yaml✅`);
    if (lang === 'javascript') {
      successLog(`- 生成Dockerfile✅`);
      successLog(`- 生成Nginx配置文件conf/✅`);
    } else if (lang === 'python') {
      successLog(`- 生成conf.prod.Dockerfile✅`);
      successLog(`- 生成conf.uat.Dockerfile✅`);
      successLog(`- 生成conf.test.Dockerfile✅`);
    } else {
      successLog(`- 生成Dockerfile✅`);
    }
  } catch(err) {
    errorLog(`- 生成K8sPod.yaml❌`);
    if (lang === 'javascript') {
      errorLog(`- 生成Dockerfile❌`);
      errorLog(`- 生成Nginx配置文件conf/❌`);
    } else if (lang === 'python') {
      errorLog(`- 生成conf.prod.Dockerfile❌`);
      errorLog(`- 生成conf.uat.Dockerfile❌`);
      errorLog(`- 生成conf.test.Dockerfile❌`);
    } else {
      errorLog(`- 生成Dockerfile❌`);
    }
    console.log(err);
  }
  try {
    updateJenkinsfile(projectRoot, dingtalkCICDWebhook, jobName, phone);
    successLog(`- 生成Jenkinsfile✅`);
  } catch(err) {
    errorLog(`- 生成Jenkinsfile❌ => ${err}`);
  }
  if (lang === 'java') {
      const updateJavaApplicationPom = async () => {
          try {
            const xml2js = require('xml2js');
            const parser = new xml2js.Parser();
            const builder = new xml2js.Builder();
            // pom.xml
            const src = path.resolve(__dirname, '../templates/pom-template.xml');
            const dest = path.resolve(projectRoot, 'pom.xml');
            const srcData = fs.readFileSync(src);
            const destData = fs.readFileSync(dest);
            const srcJson = await parser.parseStringPromise(srcData);
            const destJson = await parser.parseStringPromise(destData);
            destJson.project.build[0].finalName = srcJson.project.build[0].finalName;
            destJson.project.build[0].resources = srcJson.project.build[0].resources;
            destJson.project.profiles = srcJson.project.profiles;
            const destXml = builder.buildObject(destJson);
            fs.writeFileSync(dest, destXml);
            successLog(`- 配置pom.xml✅`);
          } catch(err) {
            errorLog(`- 配置pom.xml❌ => ${err}`);
          }
          try {
            // application.yml
            const applicationFile = path.resolve(projectRoot, 'src/main/resources/application.yml');
            let temp = fs.readFileSync(applicationFile, { encoding: 'utf8' });
            temp = temp.replace(/active:.*/, 'active: @profile.active@');
            fs.writeFileSync(applicationFile, temp);
            successLog(`- 配置src/main/resources/application.yml✅`);
          } catch(err) {
            errorLog(`- 配置src/main/resources/application.yml❌ => ${err}`);
          }
      }
      await updateJavaApplicationPom();
  }
}

module.exports = {
  genCIFiles,
  genJenkinsJob,
  genGitlabWebhook,
  genDingtalWebhook,
}
