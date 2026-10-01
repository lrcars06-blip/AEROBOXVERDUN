# Aerobox Verdun

Site vitrine : box de stockage en libre-service, 8 rue Jean Norton Cru, ZAC du Dragon, 55100 Verdun.
Site statique sans build. Dossier plat : tout est à la racine. Le fichier `middleware.js` relie le site au logiciel BUXIDA (il tourne sur Vercel uniquement, pas sur GitHub Pages).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Le site complet (HTML, CSS, JS) |
| `middleware.js` | Passerelle vers l'API partenaire BUXIDA (lecture seule) : répond à `/api/buxida` avec prix et disponibilités en direct |
| `mentions-legales.html` | Mentions légales (éditeur, hébergeur, médiation, propriété intellectuelle) |
| `confidentialite.html` | Politique de confidentialité RGPD et cookies |
| `404.html` | Page d'erreur (servie automatiquement par GitHub Pages et Vercel) |
| `confirmation.html` | Page « Votre box est réservé », vers laquelle Buxida renvoie le client après le paiement de la caution (adresse de retour à donner à Buxida : `https://VOTRE-SITE/confirmation.html`). Non indexée. Bloc `CONFIRM` en bas du fichier : lien espace client, nom du paramètre de référence |
| `logo.svg` | Logo officiel vectorisé, version empilée (conteneur + AEROBOX + virgule) |
| `logo-horizontal.svg` | Logo officiel, version horizontale (en-tête) |
| `favicon.svg` | Icône d'onglet (conteneur du logo) |
| `og-image.png` | Image 1200 × 630 pour les partages Facebook / réseaux |
| `robots.txt` | Autorise l'indexation |
| `.nojekyll` | Désactive Jekyll sur GitHub Pages |
| `.gitignore` | Fichiers système exclus |

## Déploiement (Vercel)

1. New Project, importer le dépôt, Framework Preset « Other », Deploy.
2. Settings → Environment Variables, ajouter :

| Variable | Valeur |
|---|---|
| `BUXIDA_API_KEY` | clé « bxk_live_… » créée dans BUXIDA (Module de réservation → Accès API), avec le droit `catalog:read`. Elle n'est affichée qu'une fois à la création. |

3. Deployments → « … » → Redeploy (les variables ne sont prises en compte qu'au déploiement suivant).

**Vérification :** `https://VOTRE-SITE/api/buxida?action=ping` doit renvoyer le nom du centre et `catalog:read` dans les scopes ; `?action=dispo` doit lister les types de box avec `price` et `dispo`.

## Comment fonctionne la liaison BUXIDA

BUXIDA expose deux choses distinctes :
- **L'API partenaire** (`api.buxida.com/v1`), en lecture seule : le site l'interroge via `middleware.js` (`/api/buxida?action=dispo`) pour afficher prix et nombre de box libres en direct (badges sous les tailles, tableau, fiche). Le rapprochement avec les 5 tailles du site se fait par surface (`areaM2`) ; les deux 14,5 m² sont départagés par le libellé (« double », « avant/arrière ») puis par le prix.
- **Le module de réservation en ligne**, page hébergée par BUXIDA où le client fait devis, contrat et caution. Le site y envoie le client par un lien : `CONFIG.buxidaUrl` dans `index.html`. Si BUXIDA accepte un paramètre d'URL pour pré-sélectionner un type de box, indiquer son nom dans `CONFIG.buxidaBoxParam` (le site y passe l'`id` du type).

Sans `buxidaUrl`, les boutons « Réserver » mènent au formulaire de rappel. Sans clé API, le site affiche ses tarifs de départ, sans badges. Un type de box complet affiche « Complet » et le bouton devient « Être prévenu d'une place libre » (formulaire de rappel).

## À faire avant mise en ligne

- [ ] `BUXIDA_API_KEY` dans Vercel (tester `?action=ping`), puis `CONFIG.buxidaUrl` et tester une réservation de bout en bout sur la page BUXIDA
- [ ] Vérifier que les 5 types de box ont une surface renseignée dans BUXIDA (`areaM2`), sinon pas de badge pour ce type
- [ ] `CONFIG.endpoint` : recevoir les demandes de rappel par e-mail, tester la réception
- [ ] `CONFIG.destination` : coordonnées GPS exactes de la parcelle
- [ ] Confirmer avec le client la plage horaire de fermeture (le site dit « 22h/24 » sans préciser les 2 heures fermées)
- [ ] Une fois le domaine connu, ajouter dans `<head>` de `index.html` :
  `<link rel="canonical" href="https://DOMAINE/">`, `<meta property="og:url" content="https://DOMAINE/">`, `<meta property="og:image" content="https://DOMAINE/og-image.png">`, puis un `sitemap.xml`
- [ ] Si l'hébergeur final n'est pas Vercel, corriger la section « Hébergement » de `mentions-legales.html`
- [ ] Vercel plan Hobby : usage commercial interdit par les CGU. Prévoir le plan Pro pour un site client en production

## Données société utilisées (registre national des entreprises, consulté le 22/09/2026)

AEROBOX, SAS au capital de 1 000 € · SIREN 105 404 602 · SIRET siège 105 404 602 00010 · RCS Bar-le-Duc · immatriculée le 22/05/2026 · TVA FR26105404602 · APE 52.10B · siège 10 B avenue de Paris, 55100 Verdun · Président Charlie Bartak · Directrice générale Aurélie Bartak.
