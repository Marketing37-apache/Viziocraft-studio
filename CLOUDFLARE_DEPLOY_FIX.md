# Fix Cloudflare Deployment

## Problème
Le déploiement échoue car Wrangler essaie de rebundler le code déjà buildé par Vite, ce qui cause des erreurs avec les imports virtuels de TanStack Start.

## Solution

Allez dans votre **Cloudflare Dashboard** :

1. **Pages** → **viziocraft** → **Settings** → **Builds & deployments**

2. **Changez la configuration** :
   - **Build command** : `npm run build` (garder tel quel)
   - **Build output directory** : `dist/client`
   - **Deploy command** : SUPPRIMER ou laisser vide

3. **Sauvegardez** et **Retry deployment**

## Pourquoi ça fonctionne

- Vite build le projet correctement (client + server)
- Cloudflare Pages détecte automatiquement `dist/server` pour SSR
- Plus besoin de `wrangler deploy` qui causait le problème

## Alternative (si ça ne fonctionne pas)

Si Cloudflare Pages n'exécute pas automatiquement le serveur SSR :

1. Allez dans **Settings** → **Functions**
2. Activez **Compatibility flags** : `nodejs_compat`
3. Redéployez

Le fichier `functions/_middleware.ts` créé dans le projet routera les requêtes vers le serveur SSR automatiquement.
