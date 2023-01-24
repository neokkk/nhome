FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

RUN apt update && apt install nginx tzdata -y

WORKDIR /etc/nginx
COPY /nginx ./conf.d/

RUN unlink ./sites-enabled/default

CMD ["nginx", "-g", "daemon off;"]
