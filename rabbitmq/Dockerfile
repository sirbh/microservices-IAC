FROM rabbitmq:3-management


RUN apt-get update && \
    apt-get install -y nodejs npm && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y dos2unix

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN dos2unix ./scripts/start_mq.sh
RUN dos2unix ./scripts/stop_mq.sh

RUN chmod +x ./scripts/start_mq.sh
RUN chmod +x ./scripts/stop_mq.sh