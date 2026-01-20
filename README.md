# Application PWA de tchat - Projet MDS

Disponible en production et à l'installation [ici](https://mahora.grolleau.angers.mds-project.fr/).

TP du cours "Développement front-end avancé Type"

Progressive web app développée en nuxtqui permet de discuter via tchat par socket.

## Prérequis

- Node: v22.12.0
- Nuxt: v3.29.3  

## Installation

### 1. Cloner le projet 

Cloner le projet en local.

En HTTPS : 
```https://github.com/Mahora974/mds_front_end_type.git```

En SSH : 
```git@github.com:Mahora974/mds_front_end_type.git```

Via le client GitHub : 
```gh repo clone Mahora974/mds_front_end_type```

### 2. Lancer l'installation

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Utilisation

### Pour lancer en développement : 

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Pour lancer en production : 


```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

### Pour prévisualiser la compilation de production en local : 

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Structuration du code

- 3 Components : 
  - AppFooter - le footer global 
  - AppHeader - le menu global
  - AppTitle - le template de titre de page
- 4 Pages : 
  - index - page d'accueil, contient un petit résumé de l'application
  - reception - page de connexion et de profil de l'utilisateur. Permet de choisir la room à rejoindre
  - [room] - page de template pour les rooms. Affiche les messages même hors connexion et permet d'envoyer du texte ou des photos
  - gallery - permet à l'utilisateur de retrouver les images enregistrée

La logique et la vue sont contenue dans les mêmes fichiers.
  