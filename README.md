# SmartDress - application V2

Design éditorial noir et blanc, polices Playfair Display + Jost, menu burger, animations.

## Mise à jour du dépôt GitHub (depuis le navigateur)
1. Dépôt smartdress > Add file > Upload files.
2. Glissez le CONTENU du dossier SmartDress extrait (App.js, app.json, package.json, assets, src, firmware...).
   Les fichiers du même nom sont remplacés. Faites Commit changes.
3. Facultatif : supprimez src/components/Preview.js (ancien fichier inutilisé).
4. Actions > Build APK > Run workflow. Téléchargez SmartDress-apk, installez app-release.apk.
   (Le fichier .github/workflows/build-apk.yml n'a pas besoin d'être modifié.)

## Contenu modifiable
- Tous les textes (entreprise, projet, FAQ, e-mail du support) : src/data/content.js
- Modèles, tailles, options, tissus, règles : src/data/catalog.js
- Formes de l'éditeur : src/data/shapes.js

## Protocole machine (inchangé)
PING | STATUS | CREATE|id|MODELE|TAILLE|COULEUR|TISSU | CANCEL|id
PONG | STATE|.. | ACK|id | PROGRESS|id|% | DONE|id | ERROR|id|code | CANCELLED|id
Modèles : TSHIRT, SWEAT, TANK, PANTS
