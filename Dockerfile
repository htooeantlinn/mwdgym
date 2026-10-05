# ============================================================
# MWD GYM — Multi-stage Production Dockerfile
# Stage 1: Build React frontend (Node)
# Stage 2: Build Spring Boot backend (Maven + JDK)
# Stage 3: Runtime Environment
# ============================================================

# ----------------------------------------------------------
# Stage 1 — Build React frontend
# ----------------------------------------------------------
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

COPY frontend/ ./
RUN npm run build

# ----------------------------------------------------------
# Stage 2 — Build Spring Boot JAR
# ----------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS backend-build
RUN apk add --no-cache maven

WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src/ ./src/
RUN mvn package -DskipTests -B

# ----------------------------------------------------------
# Stage 3 — Production runtime
# ----------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN apk add --no-cache nginx curl bash chromium fontconfig ttf-dejavu

# Nginx ဖွဲ့စည်းပုံ
RUN rm -f /etc/nginx/http.d/default.conf \
    && mkdir -p /var/cache/nginx /var/log/nginx /run/nginx /app/uploads

# Build Assets များ ကူးယူခြင်း
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY --from=backend-build /app/target/*.jar /app/app.jar
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# Fonts သွင်းယူခြင်း (Myanmar Font Support)
COPY --from=backend-build /app/src/main/resources/fonts/*.ttf /usr/share/fonts/TTF/
RUN fc-cache -f /usr/share/fonts/TTF

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8081/ || exit 1

WORKDIR /app

CMD ["sh", "-c", "nginx && java -jar /app/app.jar"]