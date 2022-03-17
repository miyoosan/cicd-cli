const JenkinsAPI = require('../JenkinsAPI');
const request = require('request')
 
const createJenkinsJob = async ({
  jobName,
  gitRepositoryUrl,
  jenkinsUrl,
  username,
  password,
}) => {
  const jenkins = new JenkinsAPI(jenkinsUrl, { username, password });
  const result = await jenkins.request(jenkins.jobAPI.create(jobName)); // 创建job
  if (result.status === 'failed') {
    return { success: false, message: 'Jenkins任务名已存在, 请检查项目名称' }
  }
  const data = require('../templates/job.json'); // 多分支流水线任务的模版
  const job = data['org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject']
  job['displayName'] = jobName;
  job['triggers']['com.igalg.jenkins.plugins.mswt.trigger.ComputedFolderWebHookTrigger']['token'] = jobName;
  job['sources']['data']['jenkins.branch.BranchSource']['source']['remote'] = gitRepositoryUrl
  job['sources']['data']['jenkins.branch.BranchSource']['source']['credentialsId'] = process.env.GITLAB_CREDENTIALS_ID;
  const res = await jenkins.request(jenkins.jobAPI.updateConfig(jobName, data)); // 更新job配置
  if (res.statusCode !== 200) {
    return { success: false, message: '配置任务失败, 请重试' }
  }
  return { success: true, message: `${jenkinsUrl}/job/${jobName}/` }
}

const addWebhookToGitlab = async ({
  webhook,
  projectPath
} = {}) => {
  return await new Promise((resolve) => {
    request(`${process.env.GITLAB_URL}/api/v4/projects/${encodeURIComponent(projectPath)}/hooks`, {
      headers: {
        'PRIVATE-TOKEN': process.env.GITLAB_PRIVATE_TOKEN,
        'Content-Type': 'application/json'
      },
      method: 'post',
      json: {
        url: webhook,
        push_events: true,
        merge_requests_events: true,
      }
    }, (error, response, body) => {
      if (response.statusCode !== 201) {
        resolve({ success: false, message: response.statusMessage });
        return;
      }
      resolve({ success: true, message: 'webhooks添加成功' });
    });
  })
}

module.exports = {
  createJenkinsJob,
  addWebhookToGitlab,
}
