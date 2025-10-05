# Yoga App

Application full-stack **Spring Boot (back)** + **Angular (front)** avec tests unitaires/intégrations et end-to-end (Cypress) et rapports de couverture.

---

## Prérequis

- **Java 11**
- **Node.js 16**
- **Angular CLI 14**
- **MySQL**

## Installer et lancer le projet

### 1) Cloner le dépôt
```sh
git clone https://github.com/Krisandr-a/Testez-une-application-full-stack.git
```

### 2) Configurer la base de données MySQL

Assurez-vous que MySQL fonctionne et créez une base de données à utiliser :

```sql
CREATE DATABASE test;
CREATE USER 'nom_utilisateur'@'localhost' IDENTIFIED BY 'mot_de_passe';
GRANT ALL PRIVILEGES ON test.* TO 'nom_utilisateur'@'localhost';
FLUSH PRIVILEGES;
```

Modifiez le fichier `application.properties` pour qu'il corresponde au nom d'utilisateur et au mot de passe de la base de données :

#### **`src/main/resources/application.properties`**
```properties
spring.datasource.username=nom_utilisateur
spring.datasource.password=mot_de_passe
```
Exécutez le script sur la base **test** : ressources/sql/script.sql

Par défaut, le compte administrateur est :
- identifiant: yoga@studio.com
- mot de passe: test!1234

### 3) Construire et tester le back
Aller dans le dossier "back"

Pour construire le back, exécuter les tests et générer le rapport de couverture JaCoCo :
```sh
mvn clean verify
```
Le rapport de couverture est disponible ici :
> back/target/site/jacoco/index.html

Pour lancer le back :
> mvn spring-boot:run

### 3) Construire et tester le front
Aller dans le dossier "front"

Installer les dépendances :

> npm install

Lancer le front :

> npm run start;

#### Tests 
##### Jest
Lancez les tests Jest et générez le rapport de couverture :
> npm run test:coverage

Le rapport de couverture est disponible ici :
> front/coverage/jest/lcov-report/index.html

##### E2E
Lancez les tests e2e :

> npm run e2e

Générez le rapport de couverture (il faut lancer les test e2e avant) :
> npm run e2e:coverage

Le rapport de couverture est disponible ici :
> front/coverage/lcov-report/index.html




