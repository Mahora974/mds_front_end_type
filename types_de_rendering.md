# Types de rendering

## SSR

### Définition

Le SSR (Server-Side Rendering) à pour principe de pré-charger la page côté serveur avant de l'envoyer au client. 

### Exemple dans le projet

Par défaut, Nuxt fait du rendu en SSR. L'ensemble de l'application est donc dans ce mode de rendu, hormis la page d'accueil.


### Référencement

![82](image.png) 

Score de référencement Lighthouse de la page d'accueil.

![75](image-6.png)

Score de référencement Lighthouse de la page de réception.

![75](image-6.png)

Score de référencement Lighthouse de la gallerie


## SSG  

### Définition

Le SSG (Satic Site Generation) permet de créer les pages qu'une seule fois (au moment de la compilation) et de le stocker en attendant un appel client. Cette méthode permet un meilleure performance au détriment de l'intéractivité.

### Exemple dans le projet

J'ai voulu tester le SSG avec la commande ```npx nuxt generate```. Seule la page des salles de discussions ne peut pas passer en SSG

```typescript
// nuxt.config.ts

export default defineNuxtConfig({
  ...

  routeRules: {
    '/': { prerender: true },
    '/rooms/**': { prerender: false },
    '/gallery': { prerender: true },
    '/reception':{ prerender: true },
  },

  ...
})
```

Une fois que la génération s'est faite correctement, on visualise cette compilataion via ```npx serve .out/public```

### Référencement
![82](image-1.png)

Score de référencement Lighthouse de la page d'accueil. Le score de référencement Lighthouse est identique. Cependant, la performance est bien meilleure qu'en SSR

![75](image-3.png)

Score de référencement Lighthouse de la page de réception.

![75](image-4.png)

Score de référencement Lighthouse de la gallerie

## ISR

### Définition

Le ISR (Incremental Static Regeneration) fonctionne de manière similaire au SSG : les pages sont générée au moment de la compilation puis stockées en attendant un appel client. Cependant, si on utilise l'ISR, lors de la génération des pages, on marque celles qui ont besoin d'être regénérées régulièrement.

### Exemple dans le projet

J'ai voulu tester le ISR avec la commande ```npx nuxt generate```. J'ai donc paramétré les routes pour que seule la page de tchat (la seule qui ne peut pas passer en ISR) ne soit pas pré-générée : 

```typescript
// nuxt.config.ts

export default defineNuxtConfig({
  ...

  routeRules: {
    '/': { isr: true },
    '/rooms/**': { prerender: false },
    '/gallery': { isr: true },
    '/reception': { isr: true },
  },

  ...
})
```

Une fois que la génération s'est faite correctement, on visualise cette compilataion via ```npx serve .out/public```

### Référencement

![82](image-2.png)

Score de référencement Lighthouse de la page d'accueil.Le score de référencement Lighthouse est identique. Cependant, la performance est bien meilleure qu'en SSR

![75](image-5.png)

Score de référencement Lighthouse de la page de réception.

![75](image-6.png)

Score de référencement Lighthouse de la gallerie

## Conclusion

Au final, j'ai décidé de laisser les 3 pages qui le peuvent en ISR parce que la performance est bien meilleure qu'en SSR.
