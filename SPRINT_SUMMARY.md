# Sprint Summary

Perioada acoperita: 16 mai 2026 - 21 mai 2026  
Scop general: stabilizarea fluxurilor reale ale aplicatiei si conectarea ecranelor principale la endpoint-urile documentate in Swagger.

## Feature-uri principale livrate

### 1. Flow complet pentru testele profesorului, pe lectii

A fost refacut fluxul de creare, editare si publicare a testelor astfel incat sa respecte modelul backend actual: un test este legat de o lectie, nu de curs in general. Profesorul poate deschide editorul din Course Editor sau Course Management, poate genera intrebari AI pentru o lectie, poate edita intrebarile draft si poate publica testul.

Implementarea a inclus:
- ruta lesson-scoped pentru test builder;
- integrarea generarii AI prin endpoint-urile de lesson AI generate, request status si inject;
- salvare pe intrebare prin endpoint-urile de question management;
- afisare read-only pentru testele deja publicate, conform restrictiilor backend;
- integrare in Course Management pentru vizualizarea si accesarea testelor unei lectii.

### 2. User Management pentru admin, conectat la backend

Pagina de administrare utilizatori a fost mutata dintr-o abordare partial locala intr-un flux backend-backed. Lista foloseste paginare, cautare, filtre si sortare server-side, iar importul CSV foloseste endpoint-ul real multipart.

Au fost acoperite:
- `GET /api/v1/users` pentru platform admin;
- `GET /api/v1/users/organization` pentru organization admin;
- paginare reala cu metadata din backend;
- import CSV prin `POST /api/v1/users/import/csv`;
- creare utilizator cu asignare optionala a profesorilor la clase;
- filtre simplificate pentru produs: All / Students / Teachers / Admins si All / Active / Inactive.

### 3. Autentificare si refresh token mai robust

Fluxul de autentificare a fost intarit pentru access token-uri scurte si refresh token cookie. `fetchWithAuth` retry-uie request-urile autentificate dupa `401`, cere access token nou prin refresh si sincronizeaza token-ul nou in storage/cookie.

Ulterior, fluxul a fost adaptat pentru cazul cross-origin, unde frontend-ul nu poate citi direct cookie-ul XSRF al API-ului. A fost adaugat suport pentru endpoint-ul de CSRF, iar refresh/logout folosesc token-ul CSRF returnat de backend.

### 4. Analytics, gradebook si statistici student/profesor

Ecranele de analytics au fost aliniate cu DTO-urile reale din Swagger. Gradebook-ul profesorului si statisticile studentului nu mai citesc campuri vechi precum `averageGrade`, `bestGrade` sau `testsPassed`, ci folosesc campurile actuale precum `averageScore`, `bestScore`, `testCount`, `passedTests`, `failedTests`, `lastAttempts` si `difficultyLessons`.

Rezultatul este ca datele venite din backend sunt afisate corect, fara valori zero artificiale sau crash-uri din cauza campurilor lipsa.

### 5. Profile pages backend-backed

Paginile de profil pentru admin, profesor si student au fost inlocuite cu un component comun conectat la backend. Profilul curent se reincarca din backend, poate salva nume/email si poate schimba parola prin endpoint-ul dedicat.

Endpoint-uri folosite:
- `GET /api/v1/users/{id}`;
- `PUT /api/v1/users/{id}`;
- `PATCH /api/v1/users/{id}/change-password`;
- `GET /api/v1/organizations/{id}` pentru contextul organizatiei.

### 6. Teacher Alerts

Pagina veche `Tests` din sidebar-ul profesorului a fost transformata in `Alerts`, folosind endpoint-urile de failure rate. Profesorul vede alerte active pentru teste, sortate dupa severitate, cu incercare best-effort de mapare catre curs si lectie pentru actiuni precum analytics sau test editor.

## Bug fixes importante

### 1. Profesorul primea 403 la Manage Students / Assign Students

Fluxul profesorului folosea endpoint-uri admin-only sau inexistente in Swagger. A fost schimbat ca sa foloseasca `GET /api/v1/courses/{courseId}/students-progress` si asignare prin clase, folosind `POST /api/v1/classrooms/{classroomId}/courses`.

### 2. Open Test Editor ducea la ruta gresita

Butonul din Course Editor trimitea profesorul la o pagina inexistenta. Link-ul a fost schimbat catre ruta reala a test builder-ului pe lectie: `/dashboard/teacher/courses/{courseId}/lessons/{lessonId}/test-builder`.

### 3. Rezultatul testului studentului facea request suplimentar gresit

Pagina de rezultat incerca sa incarce intrebarile separat prin test id, ceea ce putea produce `403`. Acum se bazeaza pe endpoint-ul corect `GET /api/v1/attempts/{attemptId}/result`.

### 4. Course editor putea sterge categoria cursului

Categoria nu venea din `full-view`, iar salvarea putea trimite `category: ""`. Editorul combina acum datele din `full-view` cu summary-ul din `my-courses`, iar categoria goala este blocata.

### 5. Admin dashboard folosea un endpoint vechi de courses

Dashboard-ul admin apela `/api/courses/public`, care nu exista in Swagger. A fost mutat la endpoint-ul versionat `GET /api/v1/courses/public`.

### 6. Admin putea sa isi dezactiveze propriul cont

User management blocheaza acum dezactivarea contului admin autentificat si afiseaza mesaj inline.

## Alte bug fixes si cleanup-uri

- Eliminat din sidebar-ul studentului link-urile vechi `My Progress` si `My Tests`.
- Eliminat din sidebar-ul profesorului link-ul vechi `Students`.
- Redenumit `Tests` in `Alerts` pentru profesor.
- Eliminat campul nefolosit `Expiration Date` din Course Editor.
- Adaugata validare pentru titlu gol la lectii.
- Reparat filtrul `Inactive` ca sa fie consistent cu afisarea non-`ACTIVE`.
- Reparat mapping-ul pentru `Admins`, care in contextul aplicatiei inseamna `ORGANIZATION_ADMIN`.
- Adaugat tracking local pentru pagini vechi ce trebuie sterse/reconstruite ulterior.
