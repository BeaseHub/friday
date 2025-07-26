# Utiliser une image Python slim pour réduire la taille
FROM python:3.12-slim

# Définir les variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root pour la sécurité
RUN useradd --create-home --shell /bin/bash appuser

# Définir le répertoire de travail
WORKDIR /app

# Copier et installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Créer les répertoires pour les uploads avec les bonnes permissions
RUN mkdir -p /app/uploads/messages /app/uploads/plans /app/uploads/profiles /app/app/uploads && \
    chown -R appuser:appuser /app

# Copier le code de l'application
COPY . .

# Changer les permissions du répertoire de l'application
RUN chown -R appuser:appuser /app

# Changer vers l'utilisateur non-root
USER appuser

# Exposer le port sur lequel l'application s'exécute
EXPOSE 8000

# Définir les variables d'environnement par défaut
ENV HOST=0.0.0.0 \
    PORT=8000

# Commande par défaut pour lancer l'application (sans migrations)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 