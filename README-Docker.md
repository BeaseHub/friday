# 🐳 Guide Docker - Friday Frontend

Ce guide explique comment conteneuriser et déployer l'application frontend Friday.

## 📋 Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+ (optionnel)

## 📁 Structure du projet Docker

```
frontend/
├── Dockerfile              # Configuration multi-stage
├── docker-compose.yml      # Orchestration Docker
├── nginx.conf             # Configuration nginx pour SPA
├── .dockerignore          # Fichiers exclus du build
├── env.example            # Variables d'environnement exemple
└── scripts/
    └── docker-build.sh    # Script d'automatisation
```

## 🏗️ Construction de l'image

### Construction simple

```bash
docker build -t friday-frontend .
```

### Construction avec URL API personnalisée

```bash
docker build -t friday-frontend \
  --build-arg VITE_API_URL=http://votre-api.com/api .
```

### Construction avec tag de version

```bash
docker build -t friday-frontend:1.0.0 \
  --build-arg VITE_API_URL=http://production-api.com/api .
```

## 🚀 Exécution du conteneur

### Méthode 1: Docker run

```bash
# Exécution simple
docker run -d -p 8080:80 --name friday-frontend friday-frontend

# Avec variables d'environnement personnalisées
docker run -d -p 8080:80 \
  --name friday-frontend \
  --env NODE_ENV=production \
  friday-frontend
```

### Méthode 2: Docker Compose (recommandée)

```bash
# Avec URL API par défaut
docker-compose up -d

# Avec URL API personnalisée
VITE_API_URL=http://votre-api.com/api docker-compose up -d --build

# Arrêt des services
docker-compose down
```

### Méthode 3: Script automatisé

```bash
# Construction avec API URL
./scripts/docker-build.sh --api-url http://votre-api.com/api --build --run

# Reconstruction complète avec API personnalisée
./scripts/docker-build.sh --api-url http://production.com/api --rebuild
```

## 🌐 Accès à l'application

Une fois le conteneur démarré, l'application est accessible sur :

- **URL locale** : http://localhost:8080
- **URL réseau** : http://votre-ip:8080
- **Health check** : http://localhost:8080/health

## 🔧 Configuration

### Variables d'environnement

Le conteneur supporte les variables d'environnement suivantes :

#### Au moment du build (ARG):

- `VITE_API_URL` : URL de l'API backend (intégrée dans le build)
- `NODE_ENV` : Environnement d'exécution (production par défaut)

#### Au moment de l'exécution (ENV):

- `NODE_ENV` : Environnement d'exécution

### Configuration Nginx

Le fichier `nginx.conf` contient :

- ✅ Configuration SPA React avec fallback vers `index.html`
- ✅ Cache optimisé pour les assets statiques (1 an)
- ✅ Compression gzip activée
- ✅ Headers de sécurité (CSP, XSS Protection, etc.)
- ✅ Endpoint de santé `/health`
- ✅ Configuration CORS prête pour API proxy
- ✅ Logs structurés

Pour modifier la configuration nginx, éditez le fichier `nginx.conf` et reconstruisez l'image.

### Exemples d'utilisation avec différentes API

#### Développement local

```bash
docker build -t friday-frontend \
  --build-arg VITE_API_URL=http://localhost:3000/api .
```

#### Test/Staging

```bash
docker build -t friday-frontend \
  --build-arg VITE_API_URL=https://api-staging.friday.com/v1 .
```

#### Production

```bash
docker build -t friday-frontend \
  --build-arg VITE_API_URL=https://api.friday.com/v1 .
```

### Volumes (optionnel)

Pour persister les logs nginx :

```bash
docker run -d -p 8080:80 \
  -v /host/logs:/var/log/nginx \
  --name friday-frontend \
  friday-frontend
```

Pour utiliser une configuration nginx personnalisée :

```bash
docker run -d -p 8080:80 \
  -v /path/to/custom/nginx.conf:/etc/nginx/conf.d/default.conf \
  --name friday-frontend \
  friday-frontend
```

## 📊 Monitoring et logs

### Voir les logs du conteneur

```bash
# Logs en temps réel
docker logs -f friday-frontend

# Dernières 100 lignes
docker logs --tail 100 friday-frontend
```

### Health check

```bash
# Vérifier la santé de l'application
curl http://localhost:8080/health
# Retourne: healthy
```

### Statistiques des ressources

```bash
docker stats friday-frontend
```

### Inspection du conteneur

```bash
docker inspect friday-frontend
```

## 🛠️ Développement et debugging

### Accès au shell du conteneur

```bash
docker exec -it friday-frontend sh
```

### Test de l'application en local

```bash
# Construction et test rapide
docker build -t friday-frontend-test \
  --build-arg VITE_API_URL=http://localhost:3000/api .
docker run --rm -p 8080:80 friday-frontend-test
```

### Vérification des variables d'environnement

```bash
# Vérifier si l'API URL est correctement intégrée
docker run --rm friday-frontend sh -c "cat /usr/share/nginx/html/assets/*.js | grep -o 'http[s]*://[^\"]*api[^\"]*' | head -5"
```

### Tester la configuration nginx

```bash
# Vérifier la syntaxe nginx
docker exec friday-frontend nginx -t

# Recharger la configuration nginx
docker exec friday-frontend nginx -s reload
```

## 🔄 Mise à jour

### Mise à jour avec Docker Compose

```bash
# Arrêt des services
docker-compose down

# Reconstruction avec nouvelle API URL
VITE_API_URL=http://nouvelle-api.com/v1 docker-compose up -d --build
```

### Mise à jour manuelle

```bash
# Arrêt du conteneur
docker stop friday-frontend

# Suppression du conteneur
docker rm friday-frontend

# Nouvelle construction avec API mise à jour
docker build -t friday-frontend \
  --build-arg VITE_API_URL=http://nouvelle-api.com/v1 .

# Redémarrage
docker run -d -p 8080:80 --name friday-frontend friday-frontend
```

### Mise à jour de la configuration nginx seulement

```bash
# Modifier le fichier nginx.conf
# Puis reconstruire l'image
docker build -t friday-frontend .
docker stop friday-frontend && docker rm friday-frontend
docker run -d -p 8080:80 --name friday-frontend friday-frontend
```

## 🧹 Nettoyage

### Suppression du conteneur et de l'image

```bash
docker stop friday-frontend
docker rm friday-frontend
docker rmi friday-frontend
```

### Nettoyage complet Docker

```bash
# Suppression des conteneurs arrêtés
docker container prune

# Suppression des images non utilisées
docker image prune

# Nettoyage complet (ATTENTION: supprime tout ce qui n'est pas utilisé)
docker system prune -a
```

## 📁 Structure de l'image

L'image Docker utilise une approche multi-stage :

1. **Stage Builder** (node:18-alpine)

   - Installation des dépendances npm
   - Configuration des variables d'environnement Vite
   - Construction de l'application avec Vite
   - Optimisation des assets avec l'URL API intégrée

2. **Stage Production** (nginx:alpine)
   - Configuration nginx optimisée pour SPA (depuis `nginx.conf`)
   - Compression gzip activée
   - Headers de sécurité configurés
   - Cache des assets statiques
   - Logs structurés

## 🔒 Sécurité

L'image inclut plusieurs mesures de sécurité :

- Utilisation d'images Alpine (surface d'attaque réduite)
- Configuration nginx sécurisée avec headers de sécurité
- Content Security Policy (CSP) configurée
- Headers anti-XSS et anti-clickjacking
- Compression et cache optimisés
- Variables sensibles gérées au moment du build

## 📝 Notes importantes

- **VITE_API_URL** est intégrée au moment du build et ne peut pas être modifiée après
- Pour changer l'URL API, il faut reconstruire l'image
- **nginx.conf** est copié dans l'image au moment du build
- Pour modifier nginx, éditez `nginx.conf` et reconstruisez
- Le port par défaut en production est **80** dans le conteneur
- L'application est servie par nginx pour de meilleures performances
- La configuration nginx gère automatiquement le routing React
- Les assets statiques sont mis en cache pour 1 an
- La compression gzip est activée pour tous les types de fichiers appropriés

## 🌍 Variables d'environnement Vite

Créez un fichier `env.example` pour référence :

```bash
# Variables d'environnement pour le frontend Friday
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
```

Toutes les variables commençant par `VITE_` sont exposées côté client et intégrées au moment du build.

## 🔧 Personnalisation nginx

Pour personnaliser la configuration nginx :

1. **Modifiez `nginx.conf`** selon vos besoins
2. **Reconstruisez l'image** : `docker build -t friday-frontend .`
3. **Redéployez** le conteneur

Exemples de personnalisations courantes :

- Ajouter des règles de proxy pour l'API
- Modifier les headers de sécurité
- Ajuster les règles de cache
- Configurer SSL/TLS
