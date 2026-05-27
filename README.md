# IP2026 Frontend

Next.js frontend application for the IP2026 project.

## Overview

This repository contains the implementation of the frontend application.

Project documentation such as system design, page-by-page planning, diagrams, backlog material, and design inspiration is maintained in the separate documentation repository:

[IP2026 Frontend System Design Docs](https://github.com/TilicaMihail/IP2026-frontend-system-design-docs)

Main references from the docs repository include:

- Frontend page-by-page overview
- UML and C4 diagrams
- Design inspiration resources
- Frontend backlog and iteration notes

## Tech Stack

- Next.js
- Tailwind
- TypeScript
- Redux 

## SonarQube Local

Instanta locala foloseste SonarQube Community Build in Docker si pastreaza
datele intre porniri:

```bash
npm run sonar:up
```

Deschide [http://localhost:9000](http://localhost:9000), autentifica-te initial
cu `admin` / `admin`, schimba parola ceruta si creeaza un token in
`My Account > Security`. Salveaza tokenul numai local:

```bash
printf 'SONAR_TOKEN=squ_tokenul_tau\n' > .env.sonar.local
npm run sonar
```

Raportul proiectului este disponibil la
[http://localhost:9000/dashboard?id=Frontend-ELearning](http://localhost:9000/dashboard?id=Frontend-ELearning).
Pentru oprirea serverului:

```bash
npm run sonar:down
```
