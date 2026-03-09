# Node ortamı
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Paketleri kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodlarını kopyala
COPY . .

# Uygulama portunu dışa aç
EXPOSE 5050

# Uygulamayı başlat
CMD ["node", "server.js"]
