# 1. 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json ./
# 安装依赖
RUN npm install
COPY . .
# 开始构建 (Vite 会生成 dist 目录)
RUN npm run build

# 2. 运行阶段
FROM nginx:alpine
# 将构建好的文件复制到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html
# 暴露 80 端口
EXPOSE 80
# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
