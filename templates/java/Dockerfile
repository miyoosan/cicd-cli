FROM openjdk:8-jdk-alpine
#添加jar包到容器中
ADD ./target/*.jar /usr/app/app.jar
WORKDIR /usr/app
RUN sh -c 'touch app.jar'
#设置容器启动时运行的命令
ENTRYPOINT ["java", "-jar", "-Xms200m", "-Xmx200m", "app.jar"]
#暴露端口
EXPOSE 8081
