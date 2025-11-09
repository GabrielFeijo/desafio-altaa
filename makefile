.PHONY: help install dev up down restart logs clean build test seed migrate

BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

.DEFAULT_GOAL := help

up: install
	@echo "$(BLUE)🚀 Iniciando serviços do Altaa.ai...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN) Serviços iniciados!$(NC)"
	@echo "$(BLUE)📍 Frontend:  http://localhost:3000$(NC)"
	@echo "$(BLUE)📍 Backend:   http://localhost:3333$(NC)"
	@echo "$(BLUE)📍 Documentação da API:  http://localhost:3333/api/docs$(NC)"

down:
	@echo "$(YELLOW)🛑 Parando serviços do Altaa.ai...$(NC)"
	@docker-compose down
	@echo "$(GREEN) Serviços parados!$(NC)"

restart: down up

logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

logs-db:
	@docker-compose logs -f postgres

ps:
	@docker-compose ps

clean:
	@echo "$(RED)🧹 Limpando todos os recursos do Docker...$(NC)"
	@docker-compose down -v --remove-orphans
	@echo "$(GREEN) Limpeza concluída!$(NC)"

build:
	@echo "$(YELLOW)🔨 Construindo todos os serviços...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN) Construção concluída!$(NC)"

rebuild: build up

migrate:
	@echo "$(YELLOW)🔄 Executando migrações do banco de dados...$(NC)"
	@docker-compose exec backend npx prisma migrate deploy
	@echo "$(GREEN) Migrações concluídas!$(NC)"

seed:
	@echo "$(YELLOW)📊 Inserindo dados iniciais no banco de dados...$(NC)"
	@docker-compose exec backend npm run prisma:seed
	@echo "$(GREEN) Banco de dados populado!$(NC)"

shell-backend:
	@docker-compose exec backend sh

shell-frontend:
	@docker-compose exec frontend sh

shell-db:
	@docker-compose exec postgres psql -U altaa -d altaa_db

studio:
	@echo "$(BLUE)🎨 Abrindo Prisma Studio...$(NC)"
	@docker-compose exec backend npx prisma studio

health:
	@echo "$(BLUE)🏥 Verificando saúde dos serviços...$(NC)"
	@echo ""
	@echo "$(YELLOW)Banco de Dados:$(NC)"
	@docker-compose exec postgres pg_isready -U altaa || echo "$(RED)❌ Não está saudável$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@curl -f http://localhost:3333/api/docs > /dev/null 2>&1 && echo "$(GREEN) Saudável$(NC)" || echo "$(RED)❌ Não está saudável$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -f http://localhost:3000 > /dev/null 2>&1 && echo "$(GREEN) Saudável$(NC)" || echo "$(RED)❌ Não está saudável$(NC)"

prune:
	@echo "$(YELLOW)🧹 Removendo recursos não utilizados do Docker...$(NC)"
	@docker system prune -af --volumes
	@echo "$(GREEN) Limpeza de recursos concluída!$(NC)"
