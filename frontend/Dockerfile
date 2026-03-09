# Node.js alpine
FROM node:18-alpine

WORKDIR /app

# Paket dosyalarını kopyala ve yükle
COPY package*.json ./
RUN npm install

# Geri kalan kodları kopyala
COPY . .

# Uygulamanın dev ortam portunu dışa aç
EXPOSE 5173

# Vite server host izni (%0.0.0.0 üzerinden)
CMD ["npm", "run", "dev", "--", "--host"]
