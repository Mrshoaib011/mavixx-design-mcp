FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY data ./data
COPY docs ./docs
COPY public ./public
USER node
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/start.js"]
