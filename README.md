# Mage – Mobile Management für Projekteinsätze

## Enterprise Web-Development – Projektkonzept

### 1. Projektidee / Motivation

Mage ist eine mobile Anwendung zur Koordination von Mitarbeitereinsätzen in projektorientierten Branchen wie Filmsets, Eventplanung oder Setbau. Im Mittelpunkt stehen die effiziente Verwaltung und Zuteilung von Arbeitskräften durch Manager.

Die App ermöglicht es Managern, mobil und standortunabhängig neue Einsätze (Jobs) zu erstellen, passende Mitarbeitende zuzuweisen und die Arbeitszeiten zentral zu erfassen. Die Einbindung externer Auftraggeber ist optional und wird derzeit nicht im Kernumfang betrachtet.

Durch den Einsatz von React Native ist die Anwendung sowohl für iOS als auch Android geeignet. Das Backend basiert auf Spring Boot und kommuniziert über eine REST-API mit einer PostgreSQL-Datenbank.

### 2. Projektziele

#### Muss-Ziele

- Entwicklung einer REST-API mit Spring Boot zur Verwaltung von:
  - User (abstrakt)
  - Managern (vererbt von User)
  - Mitarbeitenden (Employees, vererbt von User)
  - Jobs (Einsätze)
  - Zuweisungen (Assignments)
  - optional: Benachrichtigungen (Notifications)
- Entwicklung einer mobilen App mit React Native, die per HTTP mit dem Backend kommuniziert
- Umsetzung vollständiger CRUD-Funktionalitäten für alle zentralen Datenstrukturen
- Möglichkeit zur Zuweisung von Mitarbeitenden durch Manager
- Benutzerregistrierung und Authentifizierung (Manager / Mitarbeitende)

#### Soll-Ziele

- Visuelle Darstellung geplanter und vergangener Einsätze über Kalender- oder Listenansicht
- Rollenverwaltung mit verschiedenen Berechtigungen für Manager und Mitarbeitende

#### Kann-Ziele

- Integration externer Auftraggeberinformationen
- E-Mail-Verifizierung bei der Registrierung
- Push- oder In-App-Benachrichtigungen für neue Einsätze oder Statusänderungen
- Erweiterte Mitarbeiterprofile mit Qualifikationen, Bewertungen und Verfügbarkeiten
- In-App-Chatfunktion
- Erfassung und Darstellung der geleisteten Stunden durch Mitarbeitende

### 3. Funktionsbeschreibung / Anwendungsfälle

#### Hauptfunktionen:

- **Einsatz anlegen** – Manager erstellt neuen Job mit Zeit, Ort, Ansprechpartner etc.
- **Mitarbeitende zuweisen** – Auswahl und Zuweisung von Personen für einen Einsatz
- **Benachrichtigungen versenden** – Mitarbeitende werden automatisch informiert
- **Stundenerfassung** – Nach Einsatzende werden geleistete Stunden dokumentiert
- **Einsatzübersicht** – Manager behalten den Überblick über alle Einsätze, Mitarbeitende sehen ihren eigenen Kalender

#### Beispiel-Szenario:

- Ein Manager plant einen Einsatz („Filmset Potsdam, 10.12.2025, 08:00 Uhr“)
- Fünf Mitarbeitende werden diesem Einsatz zugewiesen
- Alle erhalten umgehend eine In-App-Benachrichtigung
- Nach dem Einsatz tragen die Mitarbeitenden ihre Stunden ein
- Der Manager wird über die Einträge informiert

### 4. Technisches Konzept

#### Architektur

Die Anwendung folgt einem klassischen Client-Server-Modell mit klarer Trennung von Frontend, Backend und Datenhaltung.

#### Technologien

| Komponente    | Technologie                 | Beschreibung                          |
| ------------- | --------------------------- | ------------------------------------- |
| Frontend      | React Native                | Cross-Plattform Mobile-App            |
| Backend       | Spring Boot                 | REST-API und Geschäftslogik           |
| Datenbank     | PostgreSQL                  | Relationale Datenbank                 |
| ORM           | Spring Data JPA / Hibernate | Datenzugriff und -abbildung           |
| Kommunikation | REST (JSON über HTTP)       | Schnittstelle zwischen App und Server |

### 5. Datenmodell / Entitäten

| Entität                 | Attribute                                                                              | Beziehungen / Beschreibung         |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| User (abstract)         | id, name, phone, email, password, role                                                 | Vererbt von Manager und Employee   |
| Manager                 | –                                                                                      | Erbt von User; erstellt Jobs       |
| Employee                | id, hourly_rate, availability                                                          | 1→n Assignments, 1→n Notifications |
| Job                     | id, location, date, start_time, expected_hours, contact_person, notes, manager_id (FK) | 1→n Assignments                    |
| Assignment              | id, employee_id (FK), job_id (FK), status, actual_hours, assigned_at, completed_at     | n→1 Employee, n→1 Job              |
| Notification (optional) | id, employee_id (FK), message, timestamp, read                                         | n→1 Employee                       |

**Beziehungen:**

- `User` ist Oberklasse von `Manager` und `Employee`
- Jeder `Job` wird durch einen `Manager` erstellt (`manager_id`)
- Mitarbeitende können mehreren Jobs zugewiesen sein
- Ein Job kann mehrere Mitarbeitende umfassen
- Die n:m-Beziehung wird über Assignments gelöst
- Optional: Benachrichtigungen pro Mitarbeitenden

### 6. REST-API-Spezifikation

| HTTP-Methode | Endpoint                     | Beschreibung                            |
| ------------ | ---------------------------- | --------------------------------------- |
| GET          | /employees                   | Liste aller Mitarbeitenden              |
| POST         | /employees                   | Neuen Mitarbeitenden hinzufügen         |
| GET          | /jobs                        | Alle Einsätze abrufen                   |
| POST         | /jobs                        | Neuen Einsatz erstellen                 |
| PUT          | /jobs/{id}                   | Einsatz bearbeiten                      |
| DELETE       | /jobs/{id}                   | Einsatz löschen                         |
| POST         | /assignments                 | Mitarbeitenden einem Einsatz zuweisen   |
| GET          | /assignments/{employee_id}   | Einsätze eines Mitarbeitenden abrufen   |
| GET          | /notifications/{employee_id} | Benachrichtigungen eines Mitarbeitenden |

### 7. Frontend-Konzept

Die mobile App stellt verschiedene Ansichten bereit, angepasst an die jeweilige Nutzerrolle.

#### Ansichten

- **Login / Registrierung**: Anmeldung oder Neuanlage von Nutzerkonten
- **Dashboard (Manager)**: Übersicht über alle Einsätze; Bearbeitungsfunktionen für Jobs
- **Einsatzdetails**: Anzeige aller Informationen zum Einsatz, inklusive Team
- **Mitarbeitendenübersicht**: Liste mit Rollen- und Kontaktdaten
- **Kalender (Mitarbeitende)**: Visualisierung aller eigenen Einsätze mit Status
- **Benachrichtigungen**: Anzeige aller Systemnachrichten und Job-Änderungen

### 8. Zeitplan / Meilensteine

| Woche | Aufgabe                                                  |
| ----- | -------------------------------------------------------- |
| 1     | Projektkonzept finalisieren & Datenmodell entwerfen      |
| 2     | Spring-Boot-Backend aufsetzen und REST-API entwickeln    |
| 3     | Testing vom Backend                                      |
| 4     | React-Native-App-Grundstruktur implementieren und Design |
| 5     | Verbindung Frontend ↔ Backend (API-Integration)          |
| 6     | Benachrichtigungen, Tests & Dokumentation                |

### 9. User Story und UML

#### UML

![UML Diagram of Mage](Mage_UML_Corrected.png)

#### User Story

> Als Manager möchte ich flexibel neue Einsätze planen, mein Team optimal besetzen und sicherstellen, dass alle Beteiligten rechtzeitig informiert werden. So behalte ich jederzeit den Überblick und kann auf kurzfristige Änderungen effizient reagieren.

### 10. Fazit

Mage bietet eine moderne Lösung zur Personal- und Einsatzplanung in dynamischen Branchen. Der Fokus liegt auf Benutzerfreundlichkeit, Mobilität und Effizienz. Die gewählten Technologien ermöglichen eine skalierbare, zukunftsfähige Architektur, die problemlos erweitert werden kann.

---
