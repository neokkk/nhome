FROM ubuntu:latest

RUN apt update && apt install iputils-ping nginx vim -y

WORKDIR /etc/nginx
COPY /nginx ./conf.d/

RUN unlink ./sites-enabled/default

CMD ["nginx", "-g", "daemon off;"]
