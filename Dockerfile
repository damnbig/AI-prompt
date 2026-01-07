# 1. 构建阶段
# 【修改点1】使用国内镜像源下载 Node.js
FROM m.daocloud.io/docker.io/library/node:18-alpine as builder
WORKDIR /app
COPY package.json ./

# 【修改点2】设置 npm 淘宝/阿里的国内源，飞一般的下载速度
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

COPY . .

# 接收环境变量
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

RUN npm run build

# 2. 运行阶段
# 【修改点3】使用国内镜像源下载 Nginx
FROM m.daocloud.io/docker.io/library/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
