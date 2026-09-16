# MWD GYM - Single container: nginx (port 80) + Spring Boot (port 8080)
# One command:  docker compose up -d --build
# Access:       http://localhost:8081

# ── Build stage ────────────────────────────────────────────────────
FROM eclipse-temurin:26-jdk-alpine AS builder
WORKDIR /build

RUN apk add --no-cache maven nodejs npm

# Spring Boot
COPY pom.xml ./
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# React
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────
FROM eclipse-temurin:26-jre-alpine
RUN apk add --no-cache nginx supervisor curl gettext
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar
COPY --from=builder /build/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/templates/default.conf.template

# ── Supervisord config ────────────────────────────────────────────
RUN mkdir -p /etc/supervisor/conf.d /var/log/supervisor /etc/nginx/http.d
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisord.log
pidfile=/var/run/supervisord.pid
childlogdir=/var/log/supervisor

[program:nginx]
command=nginx -g "daemon off;"
autorestart=true
priority=10

[program:springboot]
command=java -jar /app/app.jar
autorestart=true
priority=20
startsecs=10
EOF

# ── Entrypoint ────────────────────────────────────────────────────
COPY <<'ENTRYPOINT' /entrypoint.sh
#!/bin/sh
set -e
mkdir -p /etc/nginx/http.d /var/log/supervisor
envsubst '${BACKEND_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/http.d/default.conf
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
ENTRYPOINT
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]