# 基于Nginx这个镜像
FROM nginx:1.15-alpine
# 将前端打包目录下的文件复制到这个文件夹下，jenkins构建时会生成这个文件夹
COPY dist /etc/nginx/html
# 拷贝 nginx 配置文件
COPY conf/nginx.conf /etc/nginx/nginx.conf
# 设置工作目录
WORKDIR /etc/nginx/html
CMD nginx -g "daemon off;"

# 设置时区
# RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

# 创建 /admin-fe-access.log，启动nginx并使用tail -f模拟类似pm2的阻塞式进程。
# CMD touch /admin-fe-access.log && nginx && tail -f /admin-fe-access.log