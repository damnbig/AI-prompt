# 1. 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# 接收环境变量
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

RUN npm run build

# 2. 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 写入 Nginx 配置解决路由问题
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
