# Database export

MongoDB dump of the `travelhub` database, produced with `mongodump` and verified with a full
`mongorestore` round-trip. Contains the 14 seeded vacations, 2 seeded users (1 admin, 1 user),
and 6 likes — the same data produced by `Backend/src/seed.ts`.

## Restore

```bash
mongorestore --db=travelhub Database/travelhub
```

Against a containerized MongoDB (e.g. the `db` service in `docker-compose.yml`):

```bash
docker cp Database/travelhub travelhub-db-1:/tmp/travelhub
docker exec travelhub-db-1 mongorestore --db=travelhub /tmp/travelhub
```

Seeded accounts (see `Backend/src/seed.ts` for details):

| Role  | Email               | Password  |
| ----- | ------------------- | --------- |
| Admin | admin@travelhub.ai  | admin1234 |
| User  | user@travelhub.ai   | user1234  |
