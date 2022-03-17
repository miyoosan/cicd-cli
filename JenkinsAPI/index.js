// const ViewAPI = require('./src/ViewAPI');
const JobAPI = require('./src/JobAPI');
// const BuildAPI = require('./src/BuildAPI');
// const PluginAPI = require('./src/PluginAPI');
// const QueueAPI = require('./src/QueueAPI');
const { asyncRequest } = require('./src/utils');

class JenkinsAPI {
  constructor(origin, authorization = {}) {
    this.origin = origin;
    this.authorization = authorization;
    this.jobAPI = new JobAPI();
    // this.viewAPI = new ViewAPI();
    // this.buildAPI = new BuildAPI();
    // this.pluginAPI = new PluginAPI();
    // this.queueAPI = new QueueAPI();
  }
  list() {
    return {
      path: '/api/json'
    }
  }
  async request(info) {
    info.url = `${this.origin}${info.path}`;
    info.auth = this.authorization;
    info.headers = info.headers || {};
    delete info.path;
    let res = null;
    try {
      // 解决403问题
      const crumbIssuer = await asyncRequest({ url: this.origin + '/crumbIssuer/api/json', auth: info.auth, raw: true }).catch(err => err);
      crumbIssuer.data = JSON.parse(crumbIssuer.body);
      info.headers[crumbIssuer.data.crumbRequestField] = crumbIssuer.data.crumb;
      // 发起请求
      res = await asyncRequest(info);
    } catch (e) {
      // TCP链接失败等错误、404等
      res = {
        status: 'failed',
        message: e
      }
    }
    return res
  }
}

module.exports = JenkinsAPI;