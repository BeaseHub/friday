#!/bin/bash

# Script de construction et déploiement Docker pour Friday Frontend
# Usage: ./scripts/docker-build.sh [options]

set -e

# Configuration par défaut
IMAGE_NAME="friday-frontend"
IMAGE_TAG="latest"
PORT="8080"
CONTAINER_NAME="friday-frontend"
VITE_API_URL=""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "🐳 Script de build Docker - Friday Frontend"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Afficher cette aide"
    echo "  -b, --build         Construire l'image Docker"
    echo "  -r, --run           Exécuter le conteneur"
    echo "  -s, --stop          Arrêter le conteneur"
    echo "  -c, --clean         Nettoyer (arrêter et supprimer le conteneur)"
    echo "  -t, --tag TAG       Spécifier un tag pour l'image (défaut: latest)"
    echo "  -p, --port PORT     Spécifier le port local (défaut: 8080)"
    echo "  --api-url URL       Spécifier l'URL de l'API pour VITE_API_URL"
    echo "  --logs              Afficher les logs du conteneur"
    echo "  --rebuild           Reconstruire complètement (nettoyer + build + run)"
    echo ""
    echo "Exemples:"
    echo "  $0 --build                              # Construire l'image"
    echo "  $0 --build --run                        # Construire et exécuter"
    echo "  $0 --rebuild                            # Reconstruire complètement"
    echo "  $0 --tag v1.0.0 --build                 # Construire avec tag v1.0.0"
    echo "  $0 --port 3000 --run                    # Exécuter sur le port 3000"
    echo "  $0 --api-url http://api.example.com/v1 --build  # Construire avec URL API personnalisée"
}

# Fonction de log
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker n'est pas en cours d'exécution"
        exit 1
    fi
}

# Construire l'image Docker
build_image() {
    log "Construction de l'image Docker: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Construction de la commande docker build
    BUILD_CMD="docker build -t ${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Ajout des arguments de build si spécifiés
    if [[ -n "$VITE_API_URL" ]]; then
        BUILD_CMD="${BUILD_CMD} --build-arg VITE_API_URL=${VITE_API_URL}"
        log "🔗 URL API configurée: ${VITE_API_URL}"
    fi
    
    BUILD_CMD="${BUILD_CMD} ."
    
    log "Commande de build: ${BUILD_CMD}"
    
    if eval "$BUILD_CMD"; then
        log_success "Image construite avec succès: ${IMAGE_NAME}:${IMAGE_TAG}"
        if [[ -n "$VITE_API_URL" ]]; then
            log_success "✅ API URL intégrée: ${VITE_API_URL}"
        fi
    else
        log_error "Échec de la construction de l'image"
        exit 1
    fi
}

# Arrêter le conteneur existant
stop_container() {
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        log "Arrêt du conteneur existant: ${CONTAINER_NAME}"
        docker stop "${CONTAINER_NAME}"
        log_success "Conteneur arrêté"
    else
        log_warning "Aucun conteneur en cours d'exécution trouvé"
    fi
}

# Supprimer le conteneur existant
remove_container() {
    if docker ps -aq -f name="${CONTAINER_NAME}" | grep -q .; then
        log "Suppression du conteneur existant: ${CONTAINER_NAME}"
        docker rm "${CONTAINER_NAME}"
        log_success "Conteneur supprimé"
    fi
}

# Nettoyer (arrêter et supprimer)
clean_container() {
    stop_container
    remove_container
}

# Exécuter le conteneur
run_container() {
    # Vérifier si l'image existe
    if ! docker images -q "${IMAGE_NAME}:${IMAGE_TAG}" | grep -q .; then
        log_error "Image ${IMAGE_NAME}:${IMAGE_TAG} non trouvée. Construisez d'abord l'image avec --build"
        exit 1
    fi
    
    # Arrêter le conteneur existant s'il existe
    stop_container
    remove_container
    
    log "Démarrage du conteneur sur le port ${PORT}"
    
    if docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:80" \
        --restart unless-stopped \
        "${IMAGE_NAME}:${IMAGE_TAG}"; then
        
        log_success "Conteneur démarré avec succès!"
        log "🌐 Application accessible sur: http://localhost:${PORT}"
        
        # Attendre que le conteneur soit prêt
        sleep 2
        
        # Vérifier si le conteneur fonctionne
        if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
            log_success "✅ Conteneur en cours d'exécution"
        else
            log_error "❌ Le conteneur a échoué au démarrage"
            docker logs "${CONTAINER_NAME}"
            exit 1
        fi
    else
        log_error "Échec du démarrage du conteneur"
        exit 1
    fi
}

# Afficher les logs
show_logs() {
    if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
        log "Affichage des logs du conteneur ${CONTAINER_NAME}"
        docker logs -f "${CONTAINER_NAME}"
    else
        log_error "Conteneur ${CONTAINER_NAME} non trouvé ou non en cours d'exécution"
        exit 1
    fi
}

# Reconstruction complète
rebuild() {
    log "🔄 Reconstruction complète de l'application"
    clean_container
    build_image
    run_container
}

# Traitement des arguments
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--build)
            COMMAND="${COMMAND} build"
            shift
            ;;
        -r|--run)
            COMMAND="${COMMAND} run"
            shift
            ;;
        -s|--stop)
            COMMAND="${COMMAND} stop"
            shift
            ;;
        -c|--clean)
            COMMAND="${COMMAND} clean"
            shift
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        --api-url)
            VITE_API_URL="$2"
            shift 2
            ;;
        --logs)
            COMMAND="${COMMAND} logs"
            shift
            ;;
        --rebuild)
            COMMAND="rebuild"
            shift
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérification de Docker
check_docker

# Exécution des commandes
if [[ -z "$COMMAND" ]]; then
    log_warning "Aucune commande spécifiée"
    show_help
    exit 1
fi

for cmd in $COMMAND; do
    case $cmd in
        build)
            build_image
            ;;
        run)
            run_container
            ;;
        stop)
            stop_container
            ;;
        clean)
            clean_container
            ;;
        logs)
            show_logs
            ;;
        rebuild)
            rebuild
            ;;
    esac
done

log_success "🎉 Opération terminée avec succès!" 