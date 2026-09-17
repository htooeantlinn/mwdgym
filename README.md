# MWD GYM - Full Stack Fitness Platform

A full-stack fitness management platform with React frontend and Spring Boot backend in a single Docker container.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- MySQL running on host (or update DB_URL in docker-compose.yaml)

### Running the Application

1. **Clone and navigate to the project**
   ```bash
   cd /path/to/mwdgym
   ```

2. **Start the application** (builds and runs single container)
   ```bash
   docker compose up -d --build
   ```

3. **Access the application**
   - Application: http://localhost:8081
   - API endpoints: http://localhost:8081/api/...

### 🐳 Docker Commands Reference

```bash
# Build and start single container in background
docker compose up -d --build

# View logs (follow mode)
docker compose logs -f

# Start container (already built)
docker compose start

# Stop container
docker compose stop

# Stop and remove container, networks
docker compose down

# Stop, remove container AND volumes
docker compose down -v

# List all containers
docker ps -a

# List only project containers
docker compose ps

# Rebuild container
docker compose up -d --build
```

### 🔧 Development Workflow

When you make code changes:

```bash
# Rebuild and restart with updated code (both backend and frontend)
docker compose up -d --build
```

### 📁 Project Structure

```
mwdgym/
├── docker-compose.yaml    # Single container configuration
├── Dockerfile            # Multi-stage Dockerfile (Java + React)
├── nginx.conf           # Nginx config (serves React + proxies /api)
├── start.sh             # Startup script (Java + nginx)
├── pom.xml              # Backend dependencies
├── src/                 # Backend source code (Java)
├── uploads/             # Uploaded files (mounted volume)
│
└── frontend/            # React frontend source
    ├── src/            # React source code
    └── package.json    # Frontend dependencies
```

### 🔌 Architecture

- **Single Container**: `mwdgym-app` contains both Java backend and React frontend
- **Port**: Exposed on `8081` only
- **Internal Components**:
  - Java Spring Boot: Runs on port `8080` (internal)
  - Nginx: Serves React app on port `8081` and proxies `/api/*` to Java backend
- **Access Points**:
  - Application UI: `http://localhost:8081`
  - API endpoints: `http://localhost:8081/api/...`
  - File uploads: `http://localhost:8081/uploads/...`

### ⚙️ Environment Variables

Configure in `docker-compose.yaml` or via environment:

```yaml
environment:
  - DB_USERNAME=${DB_USERNAME:-root}
  - DB_PASSWORD=${DB_PASSWORD:-your_password}
  - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://localhost:8081,http://127.0.0.1:8081}
```

Set variables before running:
```bash
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
docker compose up -d --build
```

### 🗄️ Database Configuration

By default, connects to MySQL on host machine:
```yaml
DB_URL=jdbc:mysql://host.docker.internal:3306/mwdgymdb?createDatabaseIfNotExist=true
```

Update `DB_URL` in docker-compose.yaml for different MySQL setups.

### 🛠️ Troubleshooting

**Application not starting?**
```bash
# Check logs
docker compose logs

# Check container status
docker compose ps

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

**Port 8081 already in use?**
Change the port in docker-compose.yaml:
```yaml
ports:
  - "8082:8081"  # Change 8081 to 8082 or another available port
```

### 📞 Support

For issues, check:
1. Docker logs: `docker compose logs`
2. Container status: `docker compose ps`
3. Verify MySQL is running on host
4. Check Docker daemon is running

```bash
mysqldump --set-gtid-purged=OFF -u root -p mwdgymdb > mwdgymdb_backup.sql

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mwdgymdb;"

mysql -u root -p mwdgymdb < mwdgymdb_backup.sql
```