# 🐳 Friday Backend - Guide Docker

Ce guide explique comment utiliser Docker pour développer et déployer l'API Friday Backend avec FastAPI et PostgreSQL.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Démarrage rapide](#démarrage-rapide)
- [Gestion des migrations](#gestion-des-migrations)
- [Variables d'environnement](#variables-denvironnement)
- [Services et ports](#services-et-ports)
- [Commandes utiles](#commandes-utiles)
- [Développement](#développement)
- [Production](#production)
- [Dépannage](#dépannage)

## 🔧 Prérequis

- **Docker** ≥ 20.0
- **Docker Compose** ≥ 2.0
- **Git** pour cloner le projet

```bash
# Vérifier les versions
docker --version
docker-compose --version
```

## 🏗️ Architecture

```
friday-backend/
├── 🐳 Dockerfile              # Configuration de l'image Python/FastAPI
├── 🐳 docker-compose.yml      # Orchestration des services
├── 📦 requirements.txt        # Dépendances Python
├── ⚙️ alembic.ini             # Configuration Alembic
├── 📁 app/                    # Code source FastAPI
├── 📁 alembic/                # Scripts de migration
└── 📁 uploads/                # Stockage des fichiers
```

### Services Docker

| Service | Image                     | Description                |
| ------- | ------------------------- | -------------------------- |
| **app** | `mrseck/friday-be:v0.0.2` | Application FastAPI        |
| **db**  | `postgres:15-alpine`      | Base de données PostgreSQL |

## ⚙️ Configuration

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd friday-backend
```

### 2. Variables d'environnement

Les variables sont configurées directement dans `docker-compose.yml` :

```yaml
environment:
  - DATABASE_URL=postgresql://friday:friday@db:5432/friday
  - JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
  - ALGORITHM=HS256
  - ACCESS_TOKEN_EXPIRE_MINUTES=30
  - CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

## 🚀 Démarrage rapide

### 1. Construire et démarrer les services

```bash
# Construction et démarrage
docker-compose up --build -d

# Vérifier l'état des services
docker-compose ps
```

### 2. Exécuter les migrations

```bash
# Appliquer toutes les migrations
docker-compose exec app alembic upgrade head

# Vérifier l'état des migrations
docker-compose exec app alembic current
```

### 3. Tester l'application

```bash
# Test de l'API
curl http://localhost:8000

# Réponse attendue
{"message":"Welcome to the FastAPI Web Application!"}
```

## 📊 Gestion des migrations

### Commandes principales

```bash
# ✅ Appliquer les migrations
docker-compose exec app alembic upgrade head

# 📝 Créer une nouvelle migration
docker-compose exec app alembic revision --autogenerate -m "Description de la migration"

# 📋 Voir l'historique des migrations
docker-compose exec app alembic history

# 🔍 État actuel de la base
docker-compose exec app alembic current

# ⏪ Revenir à une migration spécifique
docker-compose exec app alembic downgrade <revision_id>
```

### Workflow de migration

```bash
# 1. Modifier les modèles dans app/db/models.py
# 2. Générer une migration
docker-compose exec app alembic revision --autogenerate -m "Ajout table users"

# 3. Vérifier le fichier généré dans alembic/versions/
# 4. Appliquer la migration
docker-compose exec app alembic upgrade head
```

## 🔐 Variables d'environnement

### Configuration actuelle

| Variable                      | Valeur par défaut                             | Description                   |
| ----------------------------- | --------------------------------------------- | ----------------------------- |
| `DATABASE_URL`                | `postgresql://friday:friday@db:5432/friday`   | URL de connexion PostgreSQL   |
| `JWT_SECRET_KEY`              | `your-super-secret-jwt-key...`                | Clé secrète JWT               |
| `ALGORITHM`                   | `HS256`                                       | Algorithme de chiffrement     |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`                                          | Durée d'expiration des tokens |
| `CORS_ORIGINS`                | `http://localhost:8080,http://localhost:3000` | Origins CORS autorisées       |

### Modification pour la production

1. **Créer un fichier `.env`** :

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=https://votre-domaine.com
```

2. **Modifier docker-compose.yml** :

```yaml
environment:
  - DATABASE_URL=${DATABASE_URL}
  - JWT_SECRET_KEY=${JWT_SECRET_KEY}
  - CORS_ORIGINS=${CORS_ORIGINS}
```

## 🌐 Services et ports

### Ports exposés

| Service        | Port interne | Port externe | URL                   |
| -------------- | ------------ | ------------ | --------------------- |
| **FastAPI**    | `8000`       | `8000`       | http://localhost:8000 |
| **PostgreSQL** | `5432`       | `5433`       | localhost:5433        |

### Réseau Docker

- **Réseau** : `friday-network` (bridge)
- **Communication interne** : Les services communiquent via leurs noms (`app`, `db`)

## 🛠️ Commandes utiles

### Gestion des services

```bash
# 🚀 Démarrer tous les services
docker-compose up -d

# 🛑 Arrêter tous les services
docker-compose down

# 🔄 Redémarrer un service
docker-compose restart app

# 📊 Voir les logs
docker-compose logs -f app
docker-compose logs -f db

# 💻 Accéder au shell du conteneur
docker-compose exec app bash
docker-compose exec db psql -U friday -d friday
```

### Gestion des images

```bash
# 🏗️ Reconstruire l'image (sans cache)
docker-compose build --no-cache

# 📤 Push vers le registry
docker push mrseck/friday-be:v0.0.2

# 🧹 Nettoyer les images inutilisées
docker image prune
docker system prune
```

### Base de données

```bash
# 🗄️ Backup de la base
docker-compose exec db pg_dump -U friday friday > backup.sql

# 📥 Restaurer une base
docker-compose exec -T db psql -U friday friday < backup.sql

# 🔍 Accéder à la console PostgreSQL
docker-compose exec db psql -U friday -d friday
```

## 👨‍💻 Développement

### Workflow recommandé

```bash
# 1. Démarrer l'environnement
docker-compose up -d

# 2. Modifier le code source
# Les fichiers sont montés en volume (/app)

# 3. Redémarrer pour appliquer les changements
docker-compose restart app

# 4. Créer des migrations si nécessaire
docker-compose exec app alembic revision --autogenerate -m "New feature"
docker-compose exec app alembic upgrade head

# 5. Tester l'API
curl http://localhost:8000/docs  # Swagger UI
```

### Debug et logs

```bash
# 📊 Logs en temps réel
docker-compose logs -f app

# 🐛 Mode debug (modifier docker-compose.yml)
environment:
  - DEBUG=true
  - LOG_LEVEL=debug
```

## 🚀 Production

### 1. Variables d'environnement sécurisées

```bash
# Générer une clé JWT forte
openssl rand -hex 32

# Utiliser des variables d'environnement système
export JWT_SECRET_KEY="votre-cle-forte"
export DATABASE_URL="postgresql://user:pass@prod-db:5432/friday"
export CORS_ORIGINS="https://votre-site.com"
```

### 2. Configuration production

```yaml
# docker-compose.prod.yml
services:
  app:
    image: mrseck/friday-be:v0.0.2
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
    restart: always
```

### 3. Déploiement

```bash
# 1. Build et push
docker-compose build
docker push mrseck/friday-be:v0.0.2

# 2. Déployer sur le serveur
docker-compose -f docker-compose.prod.yml up -d

# 3. Migrations en production
docker-compose exec app alembic upgrade head
```

## 🚨 Dépannage

### Problèmes courants

#### ❌ Erreur de connexion à la base

```bash
# Vérifier l'état des services
docker-compose ps

# Logs de la base de données
docker-compose logs db

# Test de connexion
docker-compose exec app python -c "
from app.core.config import settings
print('DATABASE_URL:', settings.DATABASE_URL)
"
```

#### ❌ Port déjà utilisé

```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :8000
netstat -tulpn | grep :5433

# Modifier les ports dans docker-compose.yml
ports:
  - "8001:8000"  # Port alternatif
```

#### ❌ Volumes de données

```bash
# Nettoyer les volumes
docker-compose down -v

# Recréer les volumes
docker-compose up -d
```

### Logs et monitoring

```bash
# 📊 Surveiller les ressources
docker stats

# 🔍 Inspecter un conteneur
docker-compose exec app ps aux
docker-compose exec app df -h

# 📝 Logs détaillés
docker-compose logs --tail=100 -f app
```

## 📞 Support

### Commandes de diagnostic

```bash
# ✅ Health check complet
echo "=== SERVICES ==="
docker-compose ps

echo "=== MIGRATION STATUS ==="
docker-compose exec app alembic current

echo "=== API TEST ==="
curl -s http://localhost:8000 | jq .

echo "=== DATABASE CONNECTION ==="
docker-compose exec app python -c "
from app.db.database import engine
try:
    with engine.connect() as conn:
        print('✅ Database connected successfully')
except Exception as e:
    print('❌ Database connection failed:', e)
"
```

### Liens utiles

- 📖 [Documentation FastAPI](https://fastapi.tiangolo.com/)
- 🗄️ [Documentation Alembic](https://alembic.sqlalchemy.org/)
- 🐳 [Documentation Docker Compose](https://docs.docker.com/compose/)
- 🐘 [Documentation PostgreSQL](https://www.postgresql.org/docs/)

---

## 📝 Notes

- **Version Docker Image** : `mrseck/friday-be:v0.0.2`
- **Réseau** : `friday-network` (bridge)
- **Gestion manuelle des migrations** : Les migrations ne sont **pas** automatiques
- **Volumes persistants** : Les données PostgreSQL et uploads sont persistées

**🎯 Pour une aide spécifique, consultez les logs avec `docker-compose logs -f app`**
