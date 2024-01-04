FROM rabbitmq:3-management


RUN apt-get update && \
    apt-get install -y nodejs npm && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .