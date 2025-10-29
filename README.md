# Enterprise Web-Development

# Projektkonzept

## 1. Projektidee / Motivation

Das Projekt **„Mage“** ist eine mobile Anwendung zur **Verwaltung von Mitarbeitern, Aufträgen und Arbeitszeiten** in Unternehmen, die projekt- oder eventbasiert arbeiten – beispielsweise in der **Setdressing-, Event- oder Filmbranche**.

Das Ziel der Anwendung ist es, die **Planung und Organisation von Arbeitseinsätzen** zu vereinfachen. Arbeitgeber sollen schnell neue **Jobs (Aufträge)** anlegen, die **benötigte Anzahl an Mitarbeitern** zuweisen und diese automatisch **benachrichtigen** können.

Durch den Einsatz von **React Native** können Arbeitgeber und Mitarbeiter mobil – also direkt am Set oder unterwegs – auf die Anwendung zugreifen. Das **Spring Boot-Backend** stellt eine REST-API bereit, die alle Daten verwaltet, während **PostgreSQL** als stabile relationale Datenbank dient.

---

## 2. Projektziele

### **Muss-Ziele**

- Entwicklung einer **REST-API mit Spring Boot** zur Verwaltung von:
  - Mitarbeitern (Employee)
  - Aufträgen / Jobs (Job)
  - Zuweisungen von Mitarbeitern zu Aufträgen (Assignment)
  - optional: Benachrichtigungen (Notification)
- Entwicklung einer **mobilen App mit React Native**, die über HTTP auf die API zugreift.
- Implementierung von **CRUD-Funktionalitäten** (Create, Read, Update, Delete) für alle Hauptentitäten.
- Möglichkeit zur **Zuweisung von Mitarbeitern zu einem Auftrag**.
- **Benutzerregistrierung und -anmeldung** (Arbeitgeber / Mitarbeiter).

### **Soll-Ziele**

- **Übersichtliche Darstellung** der Einsätze im Kalender oder in einer Liste.
- **Rollenmanagement** (z. B. Arbeitgeber mit Adminrechten, Mitarbeiter mit eingeschränktem Zugriff).

### **Kann-Ziele**

- **E-Mail-Verifikation** bei Registrierung.
- **Push- oder In-App-Benachrichtigungen** bei neuen Aufträgen oder Änderungen.
- **Erweiterte Mitarbeiterprofile** (z. B. Qualifikationen, Bewertungen, Verfügbarkeiten).

---

## 3. Funktionsbeschreibung / Anwendungsfälle

**Hauptfunktionen der App:**

1. **Auftrag anlegen** – Arbeitgeber erstellt einen neuen Job mit Ort, Datum, Ansprechpartner und benötigter Arbeitskraft.
2. **Mitarbeiter zuweisen** – Mitarbeiter werden einem Job zugeordnet.
3. **Benachrichtigung versenden** – Mitarbeiter erhalten eine Nachricht über den neuen Auftrag.
4. **Arbeitszeiten verwalten** – Nach Abschluss des Jobs werden die geleisteten Stunden erfasst.
5. **Übersicht anzeigen** – Arbeitgeber sehen alle laufenden und abgeschlossenen Jobs; Mitarbeiter sehen ihre Einsätze im Kalender.

**Beispiel-Use-Cases:**

- Ein Arbeitgeber legt einen neuen Auftrag an („Filmset Potsdam, 10.12.2025, 08:00 Uhr“).
- Fünf Mitarbeiter werden dem Auftrag zugewiesen.
- Jeder Mitarbeiter erhält eine Benachrichtigung in der App.
- Nach dem Einsatz werden die tatsächlich geleisteten Stunden eingetragen.

---

## 4. Technisches Konzept

### **Architektur**

Die Anwendung basiert auf einer klassischen **Client-Server-Architektur**:

### **Technologien**

| Komponente        | Technologie                 | Beschreibung                                   |
| ----------------- | --------------------------- | ---------------------------------------------- |
| **Frontend**      | React Native                | Mobile App für iOS und Android                 |
| **Backend**       | Spring Boot                 | Implementierung der REST-API und Businesslogik |
| **Datenbank**     | PostgreSQL                  | Speicherung der relationalen Daten             |
| **ORM**           | Spring Data JPA / Hibernate | Datenbankzugriff und Entity-Mapping            |
| **Kommunikation** | REST (JSON über HTTP)       | Datenaustausch zwischen App und API            |

---

## 5. Datenmodell / Entitäten

Das Datenmodell besteht aus vier zentralen Entitäten:

| Entität                       | Attribute                                                                           | Beziehungen / Beschreibung         |
| ----------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| **Employee**                  | id, name, phone, email, role, hourly_rate, availability                             | 1→n Assignments, 1→n Notifications |
| **Job**                       | id, company_name, location, date, start_time, expected_hours, contact_person, notes | 1→n Assignments                    |
| **Assignment**                | id, employee_id, job_id, status, actual_hours                                       | n→1 Employee, n→1 Job              |
| **Notification** _(optional)_ | id, employee_id, message, timestamp, read                                           | n→1 Employee                       |

**Beziehungsbeschreibung:**

- Ein **Employee** kann mehreren **Jobs** zugewiesen werden.
- Ein **Job** kann mehrere **Employees** enthalten.
- Diese n:m-Beziehung wird durch **Assignment** aufgelöst.
- Optional: Jeder Mitarbeiter kann mehrere **Notifications** erhalten.

---

## 6. REST-API-Spezifikation

| HTTP-Methode | Endpoint                     | Beschreibung                                  |
| ------------ | ---------------------------- | --------------------------------------------- |
| **GET**      | /employees                   | Liste aller Mitarbeiter abrufen               |
| **POST**     | /employees                   | Neuen Mitarbeiter anlegen                     |
| **GET**      | /jobs                        | Alle Aufträge abrufen                         |
| **POST**     | /jobs                        | Neuen Auftrag anlegen                         |
| **PUT**      | /jobs/{id}                   | Auftrag bearbeiten                            |
| **DELETE**   | /jobs/{id}                   | Auftrag löschen                               |
| **POST**     | /assignments                 | Mitarbeiter einem Job zuweisen                |
| **GET**      | /assignments/{employee_id}   | Zuweisungen eines Mitarbeiters abrufen        |
| **GET**      | /notifications/{employee_id} | Benachrichtigungen eines Mitarbeiters abrufen |

---

## 7. Frontend-Konzept

Die mobile App wird mit **React Native** entwickelt und bietet unterschiedliche Ansichten für Arbeitgeber und Mitarbeiter.

### **Hauptansichten**

1. **Login / Registrierung**

   - Benutzer kann sich anmelden oder registrieren.
   - Bei erfolgreicher Anmeldung werden individuelle Daten geladen.

2. **Dashboard (Arbeitgeber)**

   - Übersicht über alle aktuellen Jobs.
   - Buttons zum Erstellen, Bearbeiten oder Löschen von Aufträgen.

3. **Job-Detailansicht**

   - Zeigt Ort, Zeit, Ansprechpartner und zugewiesene Mitarbeiter an.
   - Möglichkeit, weitere Mitarbeiter hinzuzufügen.

4. **Mitarbeiterübersicht**

   - Liste aller Mitarbeiter mit Kontakt- und Rolleninformationen.

5. **Kalenderansicht (Mitarbeiter)**

   - Zeigt alle geplanten Einsätze an.
   - Statusanzeige (z. B. „geplant“, „bestätigt“, „abgeschlossen“).

6. **Benachrichtigungen**
   - Anzeige neuer Aufträge oder Änderungen.

---

## 8. Zeitplan / Meilensteine

| Woche | Aufgabe                                               |
| ----- | ----------------------------------------------------- |
| 1     | Projektkonzept finalisieren & Datenmodell entwerfen   |
| 2     | Spring-Boot-Backend aufsetzen und REST-API entwickeln |
| 3     | PostgreSQL-Datenbank integrieren & testen             |
| 4     | React-Native-App-Grundstruktur implementieren         |
| 5     | Verbindung Frontend ↔ Backend (API-Integration)       |
| 6     | Benachrichtigungen, Tests & Dokumentation             |

---

## 9. Fazit

**Mage** soll ein praxisnahes Tool werden, das es kleinen Unternehmen ermöglicht, ihre Arbeitskräfte effizient zu planen und zu verwalten.  
Durch den Einsatz moderner Technologien (**React Native**, **Spring Boot**, **PostgreSQL**) wird eine **skalierbare und erweiterbare Lösung** geschaffen, die sowohl **mobil** als auch **benutzerfreundlich** ist.

---
