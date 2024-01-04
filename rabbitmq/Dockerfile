FROM rabbitmq:3-management


RUN apt-get update && \
    apt-get install -y nodejs npm && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x ./scripts/start_mq.sh
RUN chmod +x ./scripts/stop_mq.sh