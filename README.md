# open-api-music

### Frontend => [here](https://github.com/haetamm/musweb)

## 📋 Project Setup

### Prerequisites

- Docker & Docker Compose installed

### 1. **Initial Setup**

Clone the repository:

```sh
git clone <repository-url>
cd open-api-music
```

### 1. **Create Environment File**

Copy and edit the environment file:

```sh
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development

# JWT Token
ACCESS_TOKEN_KEY=70fa79ba0f5221e877efab01c473dc31a4075dc30173381f901c00a80cde70c7491062384b8a6e4bbbe7119f25cea6c0fab55be8cc4daa937ee4ffafdbdcbfc8
REFRESH_TOKEN_KEY=cf452b02b12c3382ab792d02db513e42b7160a8187e606581b852c86295b29331d36d68c14921c7cb25a4326228cfae0e6d970e6313cddb26a12b15b52add147
ACCESS_TOKEN_AGE=1800

# firebase config
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# server configuration
HOST=0.0.0.0
PORT=5000

# postgres configuration 
PGUSER=musweb
PGHOST=db
PGPASSWORD=rahasia
PGDATABASE=musweb-api
PGPORT=5432

# Message Broker
RABBITMQ_SERVER=amqp://guest:guest@rabbitmq:5672

# redis
REDIS_URL=redis://redis:6379
```

---

## 🐳 Development Setup (With Docker) - RECOMMENDED

### 1. **Start Docker Containers**

Build and start the containers:

```sh
docker-compose -f docker-compose.dev.yml up --build
```

## 🏗️ Production Setup (With Docker) - RECOMMENDED

### 1. **Start Docker Containers**

Build and start the containers:

```sh
docker-compose -f docker-compose.prod.yml up --build
```

## 🗄️ Database Setup (Migration & Seeder)

### 1. **Database Migration**

Run this command in a new terminal:

```sh
docker compose -f docker-compose.dev.yml run --rm app npm run migrate
```

### 2. **Database Seeder**

Run this command in a new terminal:

```sh
docker compose -f docker-compose.dev.yml run --rm app npm run seed
```

This will:

- ✅ Run migrations
- ✅ Seed the database with initial data


## 🌐 Access the Application

After all Docker containers are running successfully, you can access each service using the following URLs:

---

### 🚀 API Server

Base URL:

```
http://localhost:5000
```

If the server is running correctly, accessing:

```
http://localhost:5000/
```

Should return:

```
Selamat jumpa
```

---

### 🐰 RabbitMQ Management Dashboard (Development Mode)

URL:

```
http://localhost:15672
```

Default credentials:

```
Username: guest
Password: guest
```

You can use this dashboard to monitor queues, exchanges, and messages.

---

### 🗄️ PostgreSQL Database (Development Mode)

#### Inside Docker Network

```
Host: db
Port: 5432
Database: musweb-api
Username: musweb
Password: rahasia
```

#### From Host Machine (e.g., DBeaver)

```
Host: 0.0.0.0
Port: 5432
Database: musweb-api
Username: musweb
Password: rahasia
```

> Make sure port `5432` is exposed in your `docker-compose` configuration.

---

## 🔴 Redis (Development Mode)

Connection URL:

```
redis://localhost:6379
```

You can connect using:
- redis-cli
- RedisInsight
- Any Redis GUI client

---
