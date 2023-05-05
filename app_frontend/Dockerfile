FROM node:16
WORKDIR /app
COPY package*.json ./
RUN apt update
RUN apt install -y lsof -y --no-install-recommends -o APT::Install-Suggests="false" -o APT::Install-Recommends="false"


RUN npm ci
# RUN npm install -g expo-cli
ENV PATH /app/node_modules/.bin:$PATH

COPY . .
EXPOSE 19006
CMD ["tail", "-f", "/dev/null"]
