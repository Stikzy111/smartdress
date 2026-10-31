# SmartDress - application V1

Application Android (Expo / React Native) pour piloter la machine SmartDress.
Couleurs : Sky Blue #0593C6, White #FCFFFF, Hot Pink #D83995.

## Obtenir l'APK sans Android Studio (depuis un navigateur)

1. Créez un compte gratuit sur github.com puis un nouveau dépôt (New repository).
2. Dans le dépôt : Add file > Upload files, glissez TOUT le contenu du dossier SmartDress
   (App.js, app.json, package.json, babel.config.js, .gitignore, dossier src), puis Commit.
3. Add file > Create new file. Nom du fichier : .github/workflows/build-apk.yml
   Collez le contenu du fichier build-apk.yml fourni, puis Commit.
4. Onglet Actions > "Build APK" > Run workflow. Attendez 10 à 15 minutes.
5. Ouvrez l'exécution terminée, section Artifacts, téléchargez SmartDress-apk (zip),
   décompressez, envoyez app-release.apk sur le téléphone et installez-le
   (autoriser les sources inconnues).

## Tester

- Sans machine : Connexion > "Activer le mode démo", puis Créer un vêtement.
- Avec la machine : flashez firmware/smartdress_esp32.ino (Arduino IDE, carte ESP32,
  bibliothèque ESP32Servo, servo sur la broche 18), puis Connexion > Rechercher SmartDress.

## Protocole (une ligne par message, terminée par \n)

Appli vers machine : PING | STATUS | CREATE|id|MODELE|TAILLE|COULEUR|TISSU | CANCEL|id
Machine vers appli : PONG | STATE|READY/PREPARING/ERROR | ACK|id | PROGRESS|id|% | DONE|id | ERROR|id|code | CANCELLED|id
Exemple : CREATE|k3x9|TSHIRT|M|WHITE|COTTON

## Structure

- src/data/catalog.js : modèles, tailles, coupes, options, tissus, règles de compatibilité
- src/services/engine.js : patron numérique, optimisation de découpe, données techniques, vérification
- src/services/ble.js : Bluetooth (BLE UART) + machine simulée
- src/screens : accueil, création en 7 étapes, fabrication, bibliothèque, connexion
