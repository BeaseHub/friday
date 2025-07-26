FROM node:18-alpine AS build

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json ./

# Installation des dépendances avec mise en cache optimisée
RUN npm ci

# Copie des fichiers de configuration
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.ts ./
COPY public/ ./public/
COPY index.html ./

# Copie du reste des fichiers sources
COPY src/ ./src/

# Configuration des variables d'environnement pour le build
ARG VITE_API_URL
ARG VITE_NODE_ENV=production

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}

# Build de l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine AS production

# Copie de la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Suppression des assets par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie des fichiers statiques du build
COPY --from=build /app/dist /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Démarrage de l'application
CMD ["nginx", "-g", "daemon off;"]
