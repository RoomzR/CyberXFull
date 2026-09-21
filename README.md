# CyberX Gomel — Esports Club Platform

Трёхслойное веб-приложение для компьютерного клуба **CyberX (Гомель)**: тёмная киберспортивная эстетика, турниры, рейтинг команд, админ-панель и SQL Server.

## Архитектура

```
CyberX/
├── api/                    # CyberX.Api.sln
│   └── src/
│       ├── CyberX.Domain      # Сущности, интерфейсы
│       ├── CyberX.Business    # Бизнес-логика, DTO, сервисы
│       ├── CyberX.Data        # EF Core + SQL Server
│       └── CyberX.WebApi      # REST API, локализация, админка
└── ui/                     # CyberX.UI.sln (React SPA)
```

UI **не ссылается** на проекты API — только HTTP-запросы.

## База данных (SQL Server)

По умолчанию используется **LocalDB** (удобно для разработки):

```
Server=(localdb)\mssqllocaldb;Database=CyberXDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Для полноценного SQL Server измените строку в `api/src/CyberX.WebApi/appsettings.json`:

```
Server=localhost;Database=CyberXDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Или укажите логин/пароль:

```
Server=localhost;Database=CyberXDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True;
```

При первом запуске API автоматически применяет миграции и заполняет БД начальными данными.

### Миграции вручную

```bash
cd api
dotnet ef database update --project src/CyberX.Data --startup-project src/CyberX.WebApi
```

## Запуск

### 1. Web API (порт 5006)

```bash
cd api
dotnet run --project src/CyberX.WebApi
```

### 2. UI (порт 5173)

```bash
cd ui
npm install
npm run dev
```

## API

| Endpoint | Описание |
|----------|----------|
| `GET /api/club/home` | Данные главной |
| `GET /api/tournaments` | Все турниры |
| `GET /api/teams?limit=10` | Рейтинг |
| `GET /api/admin/tournaments` | Админ: список (требует ключ) |
| `POST /api/admin/tournaments` | Админ: создать |
| `PUT /api/admin/tournaments/{id}` | Админ: обновить |
| `DELETE /api/admin/tournaments/{id}` | Админ: удалить |

Заголовок для админ-запросов: `X-Admin-Key: cyberx-admin-dev-key`

Ключ настраивается в `appsettings.json` → `Admin:ApiKey`.

## Админ-панель

Откройте `http://localhost:5173/admin` и введите API-ключ (`cyberx-admin-dev-key` по умолчанию).

Возможности:
- Просмотр всех турниров
- Создание / редактирование (RU + EN)
- Удаление
- Флаг «На главной»

## Локализация

- **API**: `Accept-Language: ru` / `en`
- **UI**: переключатель RU/EN в шапке

## Технологии

- ASP.NET Core 10, EF Core, SQL Server
- React 19, TypeScript, Vite, react-router-dom, i18next
