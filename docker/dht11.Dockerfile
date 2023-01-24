FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

RUN apt update && apt install make cmake gcc g++ git sudo tzdata -y

RUN git config --global --add url."https://".insteadOf git:// && \
    git config --global --add url."https://".insteadOf ssh://git@

RUN git clone https://github.com/WiringPi/WiringPi.git

RUN cd WiringPi && ./build

WORKDIR /app
COPY packages/lib/dht11/dht11.c packages/lib/dht11/Makefile packages/lib/dht11/CMakeLists.txt ./

RUN cmake .
RUN make

CMD ["./dht11"]
