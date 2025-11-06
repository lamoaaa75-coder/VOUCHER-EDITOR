# Générateur de Bons de Transport - KRAKEN

Application web standalone pour la génération rapide de bons de transport pour les comédiens de la production KRAKEN.

## 🚀 Démarrage rapide

1. Ouvrez le fichier `index.html` dans votre navigateur web
2. L'application fonctionne 100% hors ligne après le premier chargement
3. Vos données sont sauvegardées automatiquement dans votre navigateur

## 📋 Fonctionnalités

### 1. Créer un bon de transport

**Onglet "Nouveau bon"** - Vue principale de l'application

#### Étapes :
1. **Date** : Sélectionnez la date du trajet (par défaut : aujourd'hui)
2. **Comédien** : Choisissez un comédien dans la liste déroulante
   - Le téléphone et l'adresse se remplissent automatiquement
3. **Type de trajet** : Sélectionnez ALLER ou RETOUR
   - **ALLER** : Du domicile du comédien vers un lieu de tournage
   - **RETOUR** : D'un lieu de tournage vers le domicile du comédien
4. **Départ** :
   - Pour ALLER : Adresse du comédien (modifiable)
   - Pour RETOUR : Lieu de tournage (liste ou personnalisé)
5. **Arrivée** :
   - Pour ALLER : Lieu de tournage (liste ou personnalisé)
   - Pour RETOUR : Adresse du comédien (modifiable)
6. **Précisions** : Instructions optionnelles pour le chauffeur

#### Actions disponibles :
- **Générer PDF** : Crée un fichier PDF au format A5 paysage
- **Copier Texte** : Copie le bon au format texte dans le presse-papier
- **Nouveau Bon** : Réinitialise le formulaire

### 2. Gérer les comédiens

**Onglet "Comédiens"**

#### Fonctionnalités :
- **Ajouter un comédien** : Formulaire complet avec toutes les informations
- **Importer Excel/CSV** : Import en masse depuis un fichier
- **Rechercher** : Filtrage rapide par nom
- **Modifier** : Édition des informations d'un comédien
- **Supprimer** : Suppression avec confirmation

#### Champs requis :
- Prénom
- NOM (automatiquement en majuscules)
- Téléphone
- Adresse complète (rue, code postal, ville)

### 3. Gérer les lieux

**Onglet "Lieux"**

#### Lieux par défaut (créés automatiquement) :
1. Grigny - Cantine
2. Aubervilliers - Studio
3. Paris - Marvelous Prod

#### Fonctionnalités :
- **Ajouter un lieu** : Nom et adresse complète
- **Modifier** : Édition des informations
- **Supprimer** : Suppression avec confirmation

#### Option "Autre" :
Lors de la création d'un bon, vous pouvez sélectionner "Autre..." pour saisir un lieu personnalisé sans l'ajouter à la base de données.

### 4. Historique de session

**Onglet "Historique"**

- Affiche tous les bons créés durant la session en cours
- Pour chaque bon : nom, date, type de trajet, horaires
- Actions : Regénérer le PDF ou recopier le texte
- ⚠️ L'historique est temporaire et disparaît à la fermeture du navigateur

## 💾 Stockage des données

### LocalStorage
Les données sont sauvegardées automatiquement dans votre navigateur :
- ✅ **Comédiens** : Persistants (conservés après fermeture)
- ✅ **Lieux** : Persistants (conservés après fermeture)
- ❌ **Historique** : Temporaire (session uniquement)

### Sauvegardes
Pour sauvegarder vos données :
1. Pas de fonction export intégrée pour le moment
2. Les données LocalStorage restent tant que vous n'effacez pas le cache du navigateur
3. Utilisez toujours le même navigateur et profil

### ⚠️ Attention
- Ne pas vider le cache du navigateur (perte de données)
- Éviter la navigation privée (données non sauvegardées)

## 📄 Format des bons

### PDF (A5 Paysage)
```
┌─────────────────────────────────────┐
│  BON DE TRANSPORT COMÉDIEN          │
│  Production KRAKEN                  │
├─────────────────────────────────────┤
│  Date : 06/11/2025                  │
│  PASSAGER : Jean DUPONT             │
│  Contact  : 06 12 34 56 78          │
│  DÉPART   : 06/11 à 08:00           │
│             15 Rue Example          │
│             75001 Paris             │
│  ARRIVÉE  : 06/11 à 09:30           │
│             Grigny - Cantine        │
│             91350 Grigny            │
│  PRÉCISIONS : Ne pas klaxonner      │
└─────────────────────────────────────┘
```

**Nom du fichier** : `Bon_Transport_[NOM]_[DATE].pdf`

### Format Texte
```
BON DE TRANSPORT - KRAKEN
Date: 06/11/2025

Passager: Jean DUPONT
Contact: 06 12 34 56 78

TRAJET ALLER
Départ: 06/11 à 08:00
        15 Rue Example, 75001 Paris

Arrivée: 06/11 à 09:30
         Grigny - Cantine
         91350 Grigny

Précisions:
Ne pas klaxonner
```

## 📥 Import de données

### Format CSV accepté
Créez un fichier CSV avec les colonnes suivantes :
```
Prénom,NOM,Téléphone,Adresse,Ville
Jean,DUPONT,0612345678,15 Rue Example,75001 Paris
Marie,MARTIN,0698765432,8 Avenue Test,93300 Aubervilliers
```

### Étapes :
1. Onglet "Comédiens"
2. Cliquez sur "Importer Excel"
3. Sélectionnez votre fichier CSV
4. Les comédiens sont automatiquement ajoutés

### Notes :
- Le fichier doit être au format CSV (pas Excel .xlsx direct)
- Pour convertir Excel en CSV : Fichier > Enregistrer sous > CSV UTF-8
- La première ligne (en-têtes) est ignorée
- Les lignes vides sont ignorées

## 🔧 Configuration requise

### Navigateurs compatibles
- ✅ Chrome / Chromium (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Prérequis
- JavaScript activé
- LocalStorage activé
- Connexion internet uniquement pour le premier chargement (bibliothèque jsPDF)

## 🎨 Interface

### Navigation
4 onglets principaux clairement identifiés :
1. 📝 Nouveau bon (vue par défaut)
2. 👥 Comédiens
3. 📍 Lieux
4. 📋 Historique

### Design
- Interface moderne et professionnelle
- Couleurs : Tons gris/bleu/violet
- Responsive : Adapté desktop et tablette
- Feedback visuel : Notifications pour chaque action

## ⚡ Raccourcis et astuces

### Workflow rapide
1. Ajouter tous les comédiens une seule fois (ou importer CSV)
2. Vérifier les lieux (3 par défaut déjà créés)
3. Créer les bons au quotidien en 30 secondes :
   - Sélectionner date + comédien
   - Choisir ALLER/RETOUR
   - Définir horaires
   - Générer PDF

### Bonnes pratiques
- Utilisez la recherche pour trouver rapidement un comédien
- Créez les lieux récurrents pour gagner du temps
- Utilisez "Copier texte" pour envoi rapide par SMS/WhatsApp
- Consultez l'historique pour régénérer un bon identique

## ❓ Dépannage

### Le PDF ne se génère pas
- Vérifiez que tous les champs obligatoires (*) sont remplis
- Assurez-vous d'avoir une connexion internet au premier chargement
- Essayez de recharger la page (F5)

### Mes données ont disparu
- Avez-vous vidé le cache du navigateur ?
- Êtes-vous en navigation privée ?
- Utilisez-vous le même navigateur/profil ?

### L'import CSV ne fonctionne pas
- Vérifiez le format du fichier (CSV, pas Excel)
- Assurez-vous que les colonnes sont dans le bon ordre
- Vérifiez qu'il n'y a pas de caractères spéciaux

### Les lieux ne s'affichent pas
- Rechargez l'application
- Les 3 lieux par défaut devraient se créer automatiquement

## 📞 Support

Pour toute question ou problème :
1. Consultez ce README
2. Vérifiez les paramètres de votre navigateur
3. Contactez l'équipe technique de la production

## 📜 Licence

Application développée pour la production KRAKEN.
Usage interne uniquement.

---

**Version** : 1.0.0
**Date** : Novembre 2025
**Production** : KRAKEN
