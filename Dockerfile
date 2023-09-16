# Selecciona una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de la aplicación (incluyendo package.json y package-lock.json)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que se ejecutará la aplicación (por ejemplo, puerto 3000)
EXPOSE 3000

# Define el comando de inicio para ejecutar la aplicación
CMD ["node", "server.js"]
