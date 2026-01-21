#!/bin/bash

# Teacher AI Backend Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs|status|build|clean]

set -e

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="teacher-ai"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if docker-compose is installed
check_docker() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    print_success "docker-compose found"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        print_warning "Creating .env from .env.example"
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env created from .env.example"
            print_warning "Please update .env with your configuration"
            exit 1
        else
            print_error ".env.example not found"
            exit 1
        fi
    fi
    print_success ".env file found"
}

# Start services
start_services() {
    print_header "Starting Services"
    check_env

    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d

    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
        sleep 5
        print_header "Service Status"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Stop services
stop_services() {
    print_header "Stopping Services"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME stop
    print_success "Services stopped"
}

# Restart services
restart_services() {
    print_header "Restarting Services"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart
    print_success "Services restarted"
}

# Show logs
show_logs() {
    if [ -n "$1" ]; then
        print_header "Logs for $1"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f --tail=100 $1
    else
        print_header "Showing Logs (last 100 lines)"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f --tail=100
    fi
}

# Show status
show_status() {
    print_header "Service Status"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps

    print_header "Resource Usage"
    docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
}

# Build images
build_images() {
    print_header "Building Images"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build

    if [ $? -eq 0 ]; then
        print_success "Images built successfully"
    else
        print_error "Failed to build images"
        exit 1
    fi
}

# Clean up (DANGER!)
clean_all() {
    print_warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        print_header "Cleaning up"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v
        print_success "Cleanup completed"
    else
        print_warning "Cleanup cancelled"
    fi
}

# Backup database
backup_db() {
    print_header "Backing up Database"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backup_${TIMESTAMP}.sql"

    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T mysql \
        mysqldump -u root -p$(grep MYSQL_ROOT_PASSWORD .env | cut -d= -f2) teacher-ai \
        > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        print_success "Database backed up to $BACKUP_FILE"
    else
        print_error "Failed to backup database"
        exit 1
    fi
}

# Main menu
case "${1:-help}" in
    start)
        check_docker
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    build)
        check_docker
        build_images
        ;;
    backup)
        backup_db
        ;;
    clean)
        clean_all
        ;;
    help|*)
        echo "Teacher AI Backend Deployment Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start         - Start all services"
        echo "  stop          - Stop all services"
        echo "  restart       - Restart all services"
        echo "  logs [service]- Show logs (optionally for specific service)"
        echo "  status        - Show service status and resource usage"
        echo "  build         - Build Docker images"
        echo "  backup        - Backup database"
        echo "  clean         - Remove all containers and volumes (DANGER!)"
        echo "  help          - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs api"
        echo "  $0 logs mysql"
        echo "  $0 status"
        ;;
esac

