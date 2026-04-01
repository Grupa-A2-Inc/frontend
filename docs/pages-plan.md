Login
Rolul paginii
de autentificare în platformă
punct de intrare în zona protejată a aplicației
Cine are acces
utilizatori neautentificați
tipurile de utilizatori care se pot autentifica ulterior: admin, profesor, elev
Cum ajunge utilizatorul aici
din landing page
direct prin URL
prin redirect când sesiunea expiră
Ce poate face utilizatorul pe pagină
introduce email și parolă
trimite formularul de autentificare
vede erori de autentificare
merge către pagina de register
Date consumate din backend
Endpoint-uri:
POST /auth/login
Date afișate:
erori de autentificare
obiectul utilizatorului curent primit direct din login
Date trimise către backend
Endpoint-uri:
POST /auth/login
Payload-uri:
email
password
State/UI logic necesar
stare input email
stare input parolă
loading la submit
eroare la submit
redirect după login în funcție de rolul utilizatorului primit în răspuns
Navigație din pagină
către Register
către dashboard-ul specific rolului după login
Decizii / întrebări deschise
forgot password nu intră în MVP
după login redirect-ul se face pe dashboard pe baza rolului utilizatorului logat
răspunsul de la login trebuie să conțină direct și obiectul utilizatorului, nu doar token-ul

Register
Rolul paginii
de creare a unei organizații noi în platformă
de creare a contului de administrator principal al organizației
nu este un simplu register de utilizator individual
Cine are acces
utilizatori neautentificați care vor să creeze o organizație nouă
în urma register-ului rezultă un cont de admin legat 1 la 1 de organizație
profesorii și elevii nu își creează singuri conturi
Cum ajunge utilizatorul aici
din landing page
din Login
direct prin URL
Ce poate face utilizatorul pe pagină
introduce datele administratorului principal
introduce datele organizației
trimite formularul de creare organizație + cont admin
vede erori de validare și erori de business
după succes intră în platformă ca admin
Date consumate din backend
Endpoint-uri:
POST /auth/register-organization
Date afișate:
erori de validare
erori de business, de exemplu email deja folosit sau organizație duplicată
obiectul utilizatorului admin și organizația create, dacă backend-ul le întoarce direct
Date trimise către backend
Endpoint-uri:
POST /auth/register-organization
Payload-uri:
adminFirstName
adminLastName
adminEmail
adminPassword
organizationName
country
city
organizationType
address opțional
phoneNumber opțional
State/UI logic necesar
stare input-uri formular
validare client-side
loading la submit
eroare la submit
succes la submit
redirect după succes către dashboard admin
Navigație din pagină
către Login
către Admin Dashboard după register reușit
Decizii / întrebări deschise
register-ul creează simultan organizația și contul de admin
relația este 1 la 1 între organizație și contul admin inițial
profesorii și elevii nu au self-register
trebuie stabilite câmpurile finale obligatorii pentru organizație

Admin Dashboard
Rolul paginii
pagină de overview pentru administratorul organizației
punct principal de intrare în zona de administrare după login
loc pentru vizualizarea KPI-urilor și a stării generale a organizației
loc pentru editarea rapidă a informațiilor de bază despre organizație
Cine are acces
administratorul organizației
eventual alți administratori ai aceleiași organizații, dacă modelul final permite mai mulți admini
Cum ajunge utilizatorul aici
prin redirect după login/register ca admin
din meniul principal de navigație
Ce poate face utilizatorul pe pagină
vede statistici generale despre organizație
vede un sumar al structurii organizației
vede situații care cer atenție, de exemplu clase fără profesor sau elevi neasignați
accesează rapid paginile de management
modifică informațiile de bază ale organizației direct din dashboard
Payment info 
la prima accesare poate vedea un mini tutorial/onboarding care îi indică unde trebuie să meargă pentru a crea conturi, clase și asignări
Date consumate din backend
Endpoint-uri:
GET /admin/dashboard
GET /organizations/me sau echivalentul pe organizația adminului logat
Date afișate:
număr total elevi
număr total profesori
număr total clase
număr total cursuri
eventual număr de cursuri publicate / active
nume organizație
tip organizație
țară
oraș
alte informații scurte de profil ale organizației
eventual liste scurte de tip warning / pending setup
Date trimise către backend
Endpoint-uri:
PUT /organizations/{organizationId} sau echivalentul PUT /organizations/me
Payload-uri:
câmpurile editabile ale organizației, cel mai probabil:
organizationName
organizationType
country
city
address opțional
phoneNumber opțional
State/UI logic necesar
loading pentru încărcarea KPI-urilor și a datelor organizației
stare de editare pentru blocul de organization settings
stare de salvare pentru update organizație
stare de eroare/succes la actualizarea organizației
eventual refresh după salvare
Componente principale
KPI / stats overview
organization summary / organization settings card
quick links către paginile de management
warnings / pending items panel, dacă îl păstrăm în MVP
Navigație din pagină
către User Management
către Class Management
Decizii / întrebări deschise
dashboard-ul nu va conține direct fluxurile complete de creare utilizatori sau management clase; acelea stau în pagini dedicate
dashboard-ul trebuie să fie util prin overview + editare rapidă a organizației
trebuie decis dacă păstrăm sau nu warnings / pending setup în MVP
nu păstrăm pagină separată de Organization Settings; editarea informațiilor de bază ale organizației se face direct din dashboard

User Management
Rolul paginii
pagină dedicată administrării conturilor din organizație
locul principal din care adminul creează și gestionează conturile de elevi și profesori
locul în care adminul poate activa, dezactiva și edita utilizatorii existenți
Cine are acces
administratorul organizației
Cum ajunge utilizatorul aici
din Admin Dashboard
din meniul principal de navigație al adminului
eventual din link-uri rapide din onboarding-ul inițial
Ce poate face utilizatorul pe pagină
vede lista utilizatorilor din organizație
filtrează utilizatorii după rol și status
caută utilizatori după nume sau email
creează conturi de elevi individual sau bulk
la crearea conturilor, sistemul trimite pe email-ul de login o parolă temporară
creează conturi de profesori individual sau bulk
la crearea conturilor, sistemul trimite pe email-ul de login o parolă temporară
editează datele de bază ale unui utilizator
activează sau dezactivează un cont
vede dacă un utilizator este elev sau profesor și ce status are
setează pentru un profesor assignmentScopeType = ALL_CLASSES sau SELECTED_CLASSES
dacă profesorul are SELECTED_CLASSES, selectează clasele către care acel profesor poate asigna cursurile create de el
Date consumate din backend
Endpoint-uri:
GET /admin/users
GET /admin/users?role=STUDENT
GET /admin/users?role=TEACHER
eventual un endpoint de template/import, dacă îl adăugăm
Date afișate:
lista utilizatorilor din organizație
nume complet
email
rol
status
eventual data creării
assignment scope-ul profesorilor
clasele permise pentru profesorii cu SELECTED_CLASSES
Date trimise către backend
Endpoint-uri:
POST /admin/users
POST /admin/users/bulk-import
PUT /admin/users/{userId}
POST /admin/users/{userId}/deactivate
POST /admin/users/{userId}/activate sau echivalent
PUT /admin/users/{userId}/assignment-scope sau echivalent
Payload-uri:
pentru creare individuală:
firstName
lastName
email
role
pentru bulk import:
fișier CSV
sau listă structurată de utilizatori
pentru editare:
câmpurile editabile de bază ale utilizatorului
pentru activate/deactivate:
de regulă fără payload sau cu payload minimal
pentru assignment scope profesor:
assignmentScopeType
classIds dacă valoarea este SELECTED_CLASSES
State/UI logic necesar
loading pentru lista de utilizatori
filtre active pentru rol și status
search query
stare de deschidere pentru create/edit flow
stare de upload/import pentru bulk create
stare de validare și eroare la import
stare pentru editarea assignment scope-ului profesorilor
refresh al listei după create/edit/activate/deactivate/update scope
Componente principale
users table/list
filtre și search pentru utilizatori
create user flow
bulk import flow
edit user flow
assignment scope editor pentru profesori
Navigație din pagină
înapoi către Admin Dashboard
către Class Management, după creare elevi dacă adminul vrea să îi repartizeze în clase
către pagina de profil a unui utilizator
Decizii / întrebări deschise
bulk import-ul este CSV, nu TXT, pentru că are structură clară
pagina separă vizual elevii și profesorii în tab-uri
la creare, backend-ul trimite pe email-ul de login o parolă temporară
assignment scope-ul profesorului se configurează aici, nu într-o pagină separată

Classes Page
Rolul paginii
pagină de overview pentru clasele din organizație
locul principal din care adminul vede toate clasele existente
punct de intrare către managementul detaliat al unei clase
Cine are acces
administratorul organizației
Cum ajunge utilizatorul aici
din Admin Dashboard
din meniul principal de navigație al adminului
eventual din fluxurile de onboarding inițial
Ce poate face utilizatorul pe pagină
vede lista claselor din organizație
caută și filtrează clasele
creează o clasă nouă
poate asigna opțional unul sau mai mulți profesori în momentul creării clasei
deschide pagina de management pentru o clasă anume
Date consumate din backend
Endpoint-uri:
GET /classes
GET /admin/users?role=TEACHER&status=ACTIVE sau echivalent, pentru lista profesorilor disponibili la creare
Date afișate:
lista claselor
numele clasei
eventual anul academic / descrierea, dacă există
numărul de elevi din fiecare clasă
numărul de profesori asignați fiecărei clase
lista profesorilor disponibili pentru formularul de creare
Date trimise către backend
Endpoint-uri:
POST /classes
eventual, dacă profesorii se trimit separat: POST /classes/{classId}/teachers
Payload-uri:
pentru creare clasă:
className
academicYear opțional
description opțional
teacherIds opțional
State/UI logic necesar
loading pentru lista claselor
search query și eventual filtre
stare de deschidere/închidere pentru modalul de creare clasă
stare formular pentru creare clasă
loading și eroare la creare
refresh listă după creare
Componente principale
classes list/table
create class modal
filtre/search pentru clase
Navigație din pagină
înapoi către Admin Dashboard
către pagina de management a unei clase specifice
Decizii / întrebări deschise
elevii nu sunt adăugați direct în create class flow; ei se gestionează în pagina dedicată a clasei
profesorii pot fi asignați opțional chiar la creare, pentru a face fluxul puțin mai util
trebuie decis dacă lista de clase este afișată ca tabel sau ca listă/carduri

Class Management Page
Rolul paginii
pagină dedicată managementului unei clase specifice
locul în care adminul vede și modifică structura unei clase după ce aceasta a fost creată
locul principal pentru administrarea elevilor unei clase
Cine are acces
administratorul organizației
Cum ajunge utilizatorul aici
din Classes Page, prin click pe o clasă
eventual din link-uri rapide din dashboard sau din alte pagini de admin
Ce poate face utilizatorul pe pagină
vede detaliile de bază ale clasei
editează datele de bază ale clasei
vede lista elevilor din clasă
adaugă elevi disponibili în clasă
scoate elevi din clasă
vede rapid câți elevi are clasa
navighează către pagina de profil a unui elev din listă
navighează către pagina de profil a unui profesor din alte referințe din sistem, dar nu gestionează profesori direct de aici
Date consumate din backend
Endpoint-uri:
GET /classes/{classId}
GET /classes/{classId}/students
GET /admin/users?role=STUDENT&status=ACTIVE
Date afișate:
numele clasei
anul academic și descrierea, dacă există
lista elevilor din clasă
lista elevilor disponibili pentru adăugare
Date trimise către backend
Endpoint-uri:
PUT /classes/{classId}
POST /classes/{classId}/students
DELETE /classes/{classId}/students/{studentId}
Payload-uri:
pentru editare clasă:
className
academicYear opțional
description opțional
pentru adăugare elevi:
studentIds
State/UI logic necesar
loading pentru datele clasei
stare de editare pentru datele clasei
loading și eroare la salvare
stare pentru adăugare elevi
refresh listă după add/remove
eventual search local în lista de elevi disponibili
Componente principale
class details / class summary
students management section
edit class flow
Navigație din pagină
înapoi către Classes Page
către pagina de profil a unui elev
Decizii / întrebări deschise
un elev este asignat unei singure clase
asocierea profesorilor la clase nu există ca relație explicită în model
singura regulă relevantă pentru profesori este assignmentScopeType, care controlează la ce clase pot asigna cursurile create de ei
pagina rămâne strict pentru managementul clasei și al elevilor, fără sumar de cursuri asignate

My Courses
Rolul paginii
pagină principală pentru profesor după login
locul central din care profesorul își vede și își gestionează cursurile
punct de intrare către vizualizarea, editarea și asignarea cursurilor proprii
Cine are acces
profesorii
Cum ajunge utilizatorul aici
prin redirect după login ca profesor
din meniul principal de navigație al profesorului
Ce poate face utilizatorul pe pagină
vede lista cursurilor create de el
caută și filtrează cursurile proprii
creează un curs nou
vede statusul cursurilor, de exemplu draft/publicat/arhivat
deschide pagina de management a unui curs
Date consumate din backend
Endpoint-uri:
GET /courses?tab=owned
Date afișate:
lista cursurilor profesorului
titlu
status
vizibilitate
data ultimei modificări
eventual număr de clase către care este asignat cursul
Date trimise către backend
Endpoint-uri:
POST /courses
Payload-uri:
pentru creare curs:
title
description opțional
visibility
State/UI logic necesar
loading pentru lista de cursuri
search query și filtre
stare de deschidere/închidere pentru create course flow
stare formular pentru creare curs
loading și eroare la creare
refresh listă după creare
Componente principale
courses list/table
create course flow
filtre/search pentru cursuri
Navigație din pagină
către pagina de management a unui curs
către Course Editor
către Assignment Management
Decizii / întrebări deschise
aceasta este pagina principală a profesorului, în locul unui dashboard separat
trebuie decis dacă afișarea cursurilor este tabel sau listă/carduri

Course Details / Course Management
Rolul paginii
pagină de management pentru un curs specific al profesorului
locul din care profesorul vede conținutul cursului și informațiile principale despre el
punct de intrare către editare, gestionarea testelor și gestionarea accesului la curs
Cine are acces
profesorul care deține cursul
eventual adminul, dacă păstrăm drept de override
Cum ajunge utilizatorul aici
din My Courses, prin click pe un curs
eventual din link-uri interne după creare curs
Ce poate face utilizatorul pe pagină
vede informațiile generale ale cursului
vede structura/conținutul cursului
vede testele asociate cursului ca parte a conținutului acestuia
vede elevii înscriși la curs, grupați pe clasele către care cursul a fost asignat
poate ordona sau analiza elevii după rezultatele la teste
poate asigna cursul către clase sau elevi, în limitele permise de scope-ul profesorului
poate elimina asignări existente ale cursului
merge către editarea cursului
merge către pagina dedicată de editare/generare a unui test
Date consumate din backend
Endpoint-uri:
GET /courses/{courseId}
GET /courses/{courseId}/tree
GET /courses/{courseId}/tests
GET /courses/{courseId}/enrolled-students sau echivalent derivat din assignments
GET /courses/{courseId}/assignments
GET /teacher/assignable-classes?courseId={courseId} sau echivalent pentru scope-ul profesorului
eventual GET /teacher/assignable-students?courseId={courseId} dacă permitem și asignare directă la elevi
Date afișate:
metadatele cursului
structura de conținut
testele asociate cursului
clasele către care este asignat cursul
elevii care au acces la curs
rezultatele relevante ale elevilor la testele cursului
lista claselor sau elevilor disponibili pentru asignare
Date trimise către backend
Endpoint-uri:
POST /courses/{courseId}/assignments
DELETE /assignments/{assignmentId} sau echivalent
Payload-uri:
pentru asignare:
classIds și/sau studentIds, în funcție de modelul final permis
State/UI logic necesar
loading pentru datele cursului
expand/collapse pentru structura cursului, dacă este cazul
stare locală pentru tab-ul activ
sortare/filtrare în lista elevilor
stare pentru add/remove assignment
loading și eroare la actualizarea asignărilor
Componente principale
tab Content
tab Students
course summary
content overview
students by class section
assignment controls integrate în tab-ul Students
quick actions pentru edit și test management
Navigație din pagină
înapoi către My Courses
către Course Editor
către pagina dedicată a unui test
către paginile de profil ale elevilor, dacă oferim link-uri directe
Decizii / întrebări deschise
pagina trebuie să rămână una de overview/management, nu editorul propriu-zis
elevii înscriși se deduc din clasele și/sau asignările către care cursul este legat
pagina folosește tab-uri
tab-ul Content include și testele asociate cursului, pentru că acestea sunt considerate parte din conținutul cursului
tab-ul Students afișează elevii care parcurg cursul, grupați pe clase, și poate permite ordonarea lor după rezultatele la teste
nu păstrăm o pagină separată de Assignment Management pentru profesor; assignment-ul este integrat în această pagină
de clarificat: profesorul poate asigna cursul doar la clase sau și direct la elevi?

Course Editor
Rolul paginii
pagină unică pentru creare și editare de curs
locul în care profesorul definește metadatele cursului și structura de conținut
locul în care profesorul construiește content tree-ul cursului, inclusiv nodurile de tip test
Cine are acces
profesorul care creează sau deține cursul
Cum ajunge utilizatorul aici
din My Courses, prin acțiunea de create course
din Course Details / Course Management, prin acțiunea de edit
Ce poate face utilizatorul pe pagină
creează un curs nou sau editează un curs existent
modifică titlul cursului
modifică descrierea cursului
setează data de expirare a cursului
construiește și reorganizează content tree-ul cursului
adaugă noduri noi în content tree
editează nodurile existente
șterge noduri existente
adaugă capitole
adaugă resurse de tip text, file, video și test
pentru nodurile de tip text, poate scrie conținut cu recunoaștere de hyperlink-uri
salvează modificările asupra cursului
Date consumate din backend
Endpoint-uri:
în modul create nu este necesar fetch inițial complex, în afară de eventuale valori default
GET /courses/{courseId}
GET /courses/{courseId}/tree
Date afișate:
metadatele cursului
data de expirare, dacă există
structura completă a content tree-ului
datele nodului selectat pentru editare
Date trimise către backend
Endpoint-uri:
POST /courses
PUT /courses/{courseId}
POST /courses/{courseId}/nodes
PUT /course-nodes/{nodeId}
DELETE /course-nodes/{nodeId}
POST /course-nodes/{nodeId}/move
endpoint dedicat de upload pentru fișiere/video, dacă backend-ul îl separă
Payload-uri:
pentru curs:
title
description
expirationDate
pentru creare nod:
parentNodeId
nodeType
resourceType
title
description opțional, pentru chapter
content pentru text
referință la fișierul încărcat pentru file/video
pentru update nod:
câmpurile editabile ale nodului
State/UI logic necesar
loading pentru datele cursului în modul edit
stare locală pentru modul create sau edit
stare pentru nodul selectat în arbore
stare pentru formularul de metadate ale cursului
stare pentru formularul nodului selectat
stare pentru deschiderea fluxului de add node
stare de salvare și eroare
eventual confirmare la ștergere
eventual stare de reordonare a nodurilor
Componente principale
course metadata section
content tree panel
node editor panel
add node flow
Navigație din pagină
înapoi către Course Details / Course Management
înapoi către My Courses
către pagina dedicată a unui test, dacă profesorul deschide un nod de test pentru editare specializată
Decizii / întrebări deschise
pagina este una singură pentru create și edit
la add node, tipul default este TEXT
chapter este un nod container și are title plus description opțional
pentru FILE și VIDEO acceptăm doar upload; dacă profesorul vrea să folosească un link extern, îl poate introduce ca text
data de expirare a cursului trebuie să determine automat arhivarea lui după ce expiră

Test Editor / AI Generate Test
Rolul paginii
pagină dedicată generării și editării unui test stabil din curs
locul în care profesorul pornește generarea cu AI pe baza conținutului cursului
locul în care profesorul revizuiește, acceptă și editează întrebările înainte ca testul să devină parte stabilă din curs
Cine are acces
profesorul care deține cursul și testul
Cum ajunge utilizatorul aici
din Course Editor, atunci când adaugă un nod de test
din Course Details / Course Management, prin click pe un test existent din content tree
Ce poate face utilizatorul pe pagină
pornește generarea unui test cu AI pe baza conținutului relevant din curs
selectează pe ce parte din conținut se bazează testul
selectează numărul de întrebări generate
primește un draft de test generat
revizuiește întrebările generate
editează manual întrebările, variantele de răspuns și răspunsul corect
șterge întrebări generate care nu sunt bune
regenerează total sau parțial întrebările
salvează testul ca resursă stabilă a cursului
publică/acceptă forma finală a testului pentru a putea fi rezolvată de elevi
Date consumate din backend
Endpoint-uri:
GET /courses/{courseId}
GET /courses/{courseId}/tree
GET /tests/{testId} pentru editarea unui test existent
POST /tests/generate-from-course-content sau echivalent pentru generare AI
Date afișate:
metadatele cursului relevante pentru test
zona de conținut selectată pentru generare
draft-ul de întrebări generate
întrebările și variantele unui test existent
Date trimise către backend
Endpoint-uri:
POST /tests/generate-from-course-content
POST /courses/{courseId}/nodes dacă testul se creează ca nod nou în content tree
POST /tests
PUT /tests/{testId}
Payload-uri:
pentru generare AI:
courseId
nodeIds sau zona de conținut selectată
questionCount
pentru salvare test:
title
description opțional
questions
pentru fiecare întrebare:
prompt
options
correctOptionIndex sau echivalent
State/UI logic necesar
loading pentru generare AI
stare pentru conținutul selectat din curs
stare pentru draft-ul testului generat
stare pentru editarea întrebărilor
stare de salvare și eroare
diferențiere clară între test neacceptat/draft și test salvat final
Componente principale
AI generate panel
questions editor
question list / question navigator
test settings panel
Navigație din pagină
înapoi către Course Editor
înapoi către Course Details / Course Management
către pagina de rezolvare a testului, dacă profesorul are și preview
Decizii / întrebări deschise
pagina trebuie să funcționeze ca un flow de tip Google Forms pentru întrebări grilă
profesorul nu scrie manual testul de la zero ca flux principal, ci pornește de la generare AI și apoi revizuiește
profesorul poate totuși adăuga manual întrebări individuale, dacă este nevoie
regenerate se poate face atât pentru tot testul, cât și pentru întrebări individuale
testul devine parte stabilă din content tree doar după ce profesorul îl acceptă și îl salvează
în etapa actuală, generarea se bazează pe conținutul cursului, nu pe performanța elevului

Courses Page
Rolul paginii
pagina principală a elevului după login
locul central din care elevul vede cursurile la care are acces
punctul principal de intrare către studiu
Cine are acces
elevii
Cum ajunge utilizatorul aici
prin redirect după login ca elev
din meniul principal de navigație al elevului
Ce poate face utilizatorul pe pagină
vede cursurile asignate lui
vede cursurile publice disponibile pe platformă
vede cursurile arhivate sau completate, în funcție de modelul final
caută și filtrează cursurile
deschide pagina de studiu a unui curs
Date consumate din backend
Endpoint-uri:
GET /courses?tab=assigned
GET /courses?tab=public
GET /courses?tab=archived sau echivalentul final
Date afișate:
lista cursurilor pe tab-ul activ
titlu
descriere scurtă
status relevant
progresul elevului pe cursurile asignate, dacă există
Date trimise către backend
în mod normal această pagină doar citește date
eventual trimite parametri de filtrare/search prin query params
State/UI logic necesar
stare locală pentru tab-ul activ
loading pentru lista de cursuri
search query și filtre
eventual paginare sau infinite scroll
Componente principale
tab Assigned
tab Public
tab Archived/Completed
courses list/grid
filtre/search pentru cursuri
Navigație din pagină
către Course Study Page
către Progress / History Page
Decizii / întrebări deschise
nu păstrăm Student Dashboard; aceasta este pagina principală a elevului
de clarificat dacă tab-ul final se numește Archived, Completed sau altceva
de clarificat dacă afișarea cursurilor este tabel, listă sau carduri

Course Study Page
Rolul paginii
pagină de studiu și consum al conținutului unui curs pentru elev
locul principal în care elevul parcurge conținutul cursului și accesează testele stabile din content tree
punctul din care elevul poate selecta teme/conținut pentru generarea unui test personalizat
Cine are acces
elevii care au acces la curs prin asignare, prin acces public sau prin alte reguli valide de acces
Cum ajunge utilizatorul aici
din Courses Page, prin click pe un curs
eventual din link-uri directe către curs, dacă elevul are acces
Ce poate face utilizatorul pe pagină
vede informațiile generale ale cursului
parcurge structura de conținut a cursului
deschide și consumă resursele cursului
deschide testele stabile din content tree și merge către rezolvarea lor
selectează orice nod de conținut ca sursă pentru un test personalizat
adaugă noduri de conținut într-o selecție temporară pentru generare test
elimină noduri din selecția temporară pentru generare test
pornește fluxul de generare a unui test personalizat pe baza selecției făcute
își vede progresul în curs
Date consumate din backend
Endpoint-uri:
GET /courses/{courseId}
GET /courses/{courseId}/tree
GET /courses/{courseId}/progress/me
eventual GET /courses/{courseId}/tests dacă testele nu se deduc complet din tree
Date afișate:
metadatele cursului
structura de conținut
resursa selectată curent
testele stabile asociate cursului
progresul elevului
selecția curentă de noduri pentru generare test
Date trimise către backend
Endpoint-uri:
POST /courses/{courseId}/progress
navigare către POST /tests/generate sau fluxul echivalent de generare test
Payload-uri:
pentru progres:
lastVisitedNodeId
eventual alte date minime de progres
pentru generare test:
courseId
nodeIds selectate
State/UI logic necesar
loading pentru datele cursului
stare pentru nodul selectat în content tree
stare pentru expand/collapse în arbore
stare pentru resursa afișată curent
stare pentru selecția temporară de noduri folosite la generare test
stare pentru progresul elevului
Componente principale
course header / progress summary
content tree panel
content viewer panel
selected topics for test panel
quick actions pentru deschiderea testelor și generarea unui test personalizat
Navigație din pagină
înapoi către Courses Page
către Test Generation Page
către Test Runner Page pentru testele stabile din curs
către Progress / History Page
Decizii / întrebări deschise
pagina este varianta de student pentru consumul cursului, nu pentru management
toate nodurile din content tree sunt eligibile pentru selecție în vederea generării unui test personalizat
selecția de noduri pentru test se face direct din pagina de studiu, de tip "add to test"
testele stabile din content tree rămân accesibile separat față de testele generate on-demand

Test Generation Page
Rolul paginii
pagină intermediară între selecția de topicuri din curs și sesiunea efectivă de test
locul în care elevul confirmă conținutul ales pentru testul personalizat și setează opțiunile testului
Cine are acces
elevii care au acces la cursul din care provin topicurile selectate
Cum ajunge utilizatorul aici
din Course Study Page, după ce elevul a selectat unul sau mai multe noduri și alege să genereze test
Ce poate face utilizatorul pe pagină
vede topicurile/nodurile selectate pentru test
elimină topicuri din selecția curentă
revine la pagina cursului pentru a adăuga sau ajusta selecția
alege numărul de întrebări
alege dacă testul are timer sau nu
dacă timerul este activ, setează durata testului
pornește generarea testului și intră în sesiunea efectivă
Date consumate din backend
în mod normal, selecția topicurilor vine din starea fluxului anterior
dacă este nevoie de revalidare, backend-ul poate primi și confirma nodurile selectate la pasul următor
Date afișate:
lista nodurilor selectate
titlurile topicurilor selectate
eventual sumarul cursului din care provin
Date trimise către backend
Endpoint-uri:
POST /tests/generate
Payload-uri:
courseId
nodeIds
questionCount
timerEnabled
timeLimitMinutes opțional, dacă timerul este activ
State/UI logic necesar
stare pentru lista topicurilor selectate
stare pentru numărul de întrebări
stare pentru timer on/off
stare pentru durata timerului
loading pentru generarea testului
eroare la generare
Componente principale
selected topics summary
test settings panel
generate and start action
Navigație din pagină
înapoi către Course Study Page
către Test Runner Page după generare reușită
Decizii / întrebări deschise
pagina este una de confirmare și configurare, nu de studiu și nici de rezolvare efectivă
elevul poate elimina topicuri din selecție direct aici
timerul este opțional pentru testele generate
timerul este de asemenea opțional și pentru testele stabile din curs; regula de timer opțional există peste tot

Test Runner Page
Rolul paginii
pagină dedicată rezolvării efective a unui test
locul în care elevul primește întrebările de la backend, răspunde la ele și trimite rezultatul final
Cine are acces
elevul care a pornit un test generat sau un test stabil și are o sesiune validă de test
Cum ajunge utilizatorul aici
din Test Generation Page, după generarea unui test personalizat
din Course Study Page, prin deschiderea unui test stabil din content tree
Ce poate face utilizatorul pe pagină
vede câte o întrebare pe rând
selectează varianta de răspuns pentru întrebarea curentă
navighează între întrebări
vede progresul în test
vede timerul, dacă testul are timer activ
trimite testul la final pentru evaluare
Date consumate din backend
Endpoint-uri:
GET /test-sessions/{testSessionId} sau echivalent
Date afișate:
întrebările testului
variantele de răspuns
răspunsurile deja selectate, dacă pagina se reîncarcă
indexul/progresul curent
durata rămasă, dacă există timer
Date trimise către backend
Endpoint-uri:
POST /test-sessions/{testSessionId}/submit
Payload-uri:
answers
pentru fiecare răspuns:
questionId
selectedOptionId sau echivalent
State/UI logic necesar
stare pentru întrebarea curentă
stare pentru răspunsurile selectate
stare pentru progresul în test
stare pentru timer, dacă există
loading la submit
eroare la submit
Componente principale
question display
answer options
question navigation controls
progress indicator
timer display
submit action
Navigație din pagină
către Test Results Page după submit reușit
Decizii / întrebări deschise
întrebările se afișează una câte una, nu toate într-o singură pagină cu scroll
răspunsurile se rețin local pe parcursul sesiunii și se trimit la backend la final
folosim doar submit final, fără autosave intermediar în MVP

Test Results Page
Rolul paginii
pagină dedicată afișării rezultatului unui test finalizat
locul în care elevul vede scorul, răspunsurile sale și corectitudinea acestora
locul în care elevul poate semnala întrebări greșite în cazul testelor generate
Cine are acces
elevul care a rezolvat testul
eventual profesorul și adminul, dacă ulterior permitem acces de review asupra rezultatelor
Cum ajunge utilizatorul aici
din Test Runner Page, după submit reușit
eventual din Course Progress Page, prin deschiderea unui attempt anterior
Ce poate face utilizatorul pe pagină
vede scorul final al testului
vede fiecare întrebare cu răspunsul dat și răspunsul corect
vede ce întrebări au fost corecte sau greșite
pentru testele generate, poate raporta o întrebare considerată greșită sau problematică
poate merge către progresul pe curs sau înapoi către curs
poate porni un alt test, dacă fluxul final permite asta
Date consumate din backend
Endpoint-uri:
GET /attempts/{attemptId}
GET /attempts/{attemptId}/review
GET /attempts/{attemptId}/mastery dacă vrem și impactul pe topicuri
Date afișate:
scorul final
întrebările testului
opțiunile de răspuns
răspunsul selectat de elev
răspunsul corect
marcaj corect/greșit
eventual topicurile afectate
informația dacă testul este generat sau stabil
Date trimise către backend
Endpoint-uri:
POST /attempts/{attemptId}/question-reports sau echivalent, pentru raportarea unei întrebări dintr-un test generat
Payload-uri:
questionId
reason sau message
State/UI logic necesar
loading pentru datele rezultatului
stare locală pentru filtre de review, dacă apar
stare pentru deschiderea și trimiterea formularului de report question
loading și eroare la trimiterea raportării
Componente principale
score summary
question review list
report question flow pentru testele generate
navigation actions
Navigație din pagină
către Course Study Page
către Course Progress Page
eventual către Test Generation Page sau către un nou test
Decizii / întrebări deschise
raportarea întrebărilor greșite există pentru testele generate, deoarece întrebările produse de AI pot conține erori
momentan, raportarea se face prin motive presetate, nu prin mesaj liber
poate exista un modal în care elevul indică și ce răspuns crede că este corect
deocamdată nu introducem un flow complet de review pentru profesor/admin
ca idee ulterioară, răspunsul elevului la raportare ar putea fi analizat de un LLM și explicat ulterior într-o zonă separată de clarificări
ca idee ulterioară, întrebarea raportată ar putea fi trimisă și profesorului, dar acest flux nu intră acum în plan

My Progress Page
Rolul paginii
pagină generală și light de progres pentru elev
locul în care elevul vede câteva statistici agregate simple despre activitatea lui în platformă
punct de intrare către progresul detaliat pe fiecare curs
Cine are acces
elevii, pentru propriile date
Cum ajunge utilizatorul aici
din meniul principal de navigație al elevului
eventual din Courses Page sau din Course Study Page
Ce poate face utilizatorul pe pagină
vede câteva statistici generale despre activitatea lui
vede ce cursuri are active și câte a completat
vede câte teste a rezolvat în total
vede eventual activitatea recentă relevantă
intră pe pagina de progres pentru un curs anume
Date consumate din backend
Endpoint-uri:
GET /progress/me/summary sau echivalent
eventual GET /progress/me/recent-activity
Date afișate:
număr de cursuri active
număr de cursuri completate
număr total de teste rezolvate
eventual ultimele activități relevante
lista cursurilor pentru care există progres detaliat
Date trimise către backend
această pagină este în principal read-only
State/UI logic necesar
loading pentru statisticile generale
eventual stare locală pentru filtre minime sau sortare în lista cursurilor
Componente principale
summary stats
recent activity section
courses progress list
Navigație din pagină
către Course Progress Page pentru un curs specific
către Courses Page
Decizii / întrebări deschise
pagina rămâne una light și nu încearcă să compare în mod serios progresul între cursuri foarte diferite
progresul real și detaliat se vede pe pagina separată de progres pe curs

Course Progress Page
Rolul paginii
pagină detaliată de progres pentru combinația student + course
locul principal în care se vede progresul real al unui elev într-un curs specific
pagină comună ca model pentru elev, profesor și admin, în funcție de permisiuni
Cine are acces
elevul pentru propriul progres în curs
profesorul cursului
adminul organizației
Cum ajunge utilizatorul aici
din My Progress Page
din Course Study Page
din Course Details / Course Management, dacă profesorul deschide progresul unui elev din lista de students
din referințe administrative către un elev și un curs
Ce poate face utilizatorul pe pagină
vede progresul de parcurgere al conținutului unui curs
vede câte teste stabile din curs au fost completate
vede media la testele stabile ale cursului
vede câte teste generate au fost rezolvate pe baza cursului
vede istoricul încercărilor pentru testele din acel curs
deschide rezultatul unui attempt anume
pentru elev, poate reveni la curs pentru a continua studiul
Date consumate din backend
Endpoint-uri:
GET /students/{studentId}/courses/{courseId}/progress sau echivalent
GET /students/{studentId}/courses/{courseId}/attempts
Date afișate:
numele elevului
numele cursului
procent de content completion
număr de teste stabile completate
media pe testele stabile
număr de teste generate rezolvate
activitate recentă / last activity
lista de attempts asociate cursului
Date trimise către backend
această pagină este în principal read-only
State/UI logic necesar
loading pentru datele de progres pe curs
eventual filtre sau sortare pentru attempts
stare locală pentru secțiuni/tab-uri dacă vom avea nevoie mai târziu
Componente principale
course progress summary
progress bars
attempts history table/list
navigation actions
Navigație din pagină
către Test Results Page pentru un attempt
către Course Study Page
către pagina de profil a elevului, dacă accesul este din rol de profesor/admin
Decizii / întrebări deschise
aceasta este pagina importantă de progres, nu pagina generală agregată
procentul de progres pe conținut trebuie bazat pe resursele efectiv parcurse/vizualizate
media are sens în principal pentru testele stabile, care sunt comparabile în cadrul aceluiași curs
istoricul este scoped pe curs, nu global pe toată platforma

Profile Page
Rolul paginii
pagină comună de profil pentru toți utilizatorii platformei
locul în care se văd datele de bază ale unui utilizator și, în funcție de permisiuni, acestea pot fi editate
locul în care pot apărea mini statistici relevante pentru rolul utilizatorului
Cine are acces
orice utilizator autentificat își poate accesa propriul profil
adminul poate accesa și profilurile altor utilizatori
profesorii și elevii pot vedea profiluri din link-uri/referințe doar în măsura permisă de fluxurile aplicației, dar fără drept de editare
Cum ajunge utilizatorul aici
din meniul principal al aplicației, pentru propriul profil
din liste și referințe către utilizatori, pentru profilul altcuiva
Ce poate face utilizatorul pe pagină
vede datele de bază ale profilului
își editează propriile date, dacă se află pe propriul profil
își schimbă parola, dacă se află pe propriul profil
vede poza de profil, numele și datele principale ale utilizatorului
vede mini statistici relevante pentru rolul utilizatorului, dacă există
dacă este admin, poate edita și profilul altui utilizator
Date consumate din backend
Endpoint-uri:
GET /users/{userId} sau GET /users/me, în funcție de context
eventual un endpoint de stats profil, dacă backend-ul îl separă
Date afișate:
firstName
lastName
profilePicture
email
rolul utilizatorului
organizația utilizatorului
mini statistici relevante pentru rol
pentru elev: cursuri completate, teste rezolvate, eventual alte statistici simple
pentru profesor: cursuri create, teste create, clase în scope
pentru admin: profil mai degrabă simplu, fără accent pe statistici
Date trimise către backend
Endpoint-uri:
PUT /users/me
PUT /users/{userId} dacă adminul editează alt utilizator
PUT /users/me/password
eventual endpoint de upload pentru poza de profil
Payload-uri:
pentru profil:
firstName
lastName
profilePicture sau referință către fișierul încărcat
pentru schimbare parolă:
currentPassword
newPassword
State/UI logic necesar
loading pentru datele profilului
stare de editare pentru profil
loading și eroare la salvare
stare pentru schimbare parolă
diferențiere clară între mod view-only și mod editabil, în funcție de cine accesează profilul
Componente principale
profile summary
profile edit form
change password section
mini stats section
Navigație din pagină
înapoi către pagina anterioară relevantă
către paginile de curs/progres dacă profilul este accesat dintr-un flux contextual
Decizii / întrebări deschise
propriul profil este editabil de utilizatorul curent
dacă se accesează profilul altcuiva, acesta este view-only, cu excepția adminului care poate edita
email-ul este în principiu read-only
hours spent studying ar trebui adăugat doar dacă poate fi calculat într-un mod credibil; altfel rămâne în afara MVP


Landing Page

Landing Page este pagina publică principală a platformei, destinată utilizatorilor neautentificați. Rolul ei este să prezinte pe scurt produsul, să explice cui se adresează și să conducă utilizatorul către acțiunile principale: creare organizație și autentificare. Pagina nu are logică complexă de business și, în MVP, poate fi complet statică.
Secțiunile principale ale paginii sunt: Header public, Hero, How It Works, Benefits by Role, Core Features, Product Preview, FAQ, Final CTA și Footer. Împreună, aceste secțiuni explică valoarea produsului, fluxul general al platformei și diferențele de utilizare între admin, profesor și elev.

