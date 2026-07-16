# 🍺 L'École du Bélier - Site Web

Site officiel de la femto-brasserie artisanale **L'École du Bélier**, spécialisée dans le brassage de bières artisanales de qualité en Nouvelle-Aquitaine.

## 🚀 Stack Technique

- **Framework**: [Astro](https://astro.build) v7.0.6 (Static Site Generator)
- **Langage**: TypeScript
- **Validation**: Zod pour la validation runtime des données
- **Optimisation d'images**: astro:assets
- **SEO**: @astrojs/sitemap v3.7.3 + JSON-LD structured data
- **Tests**: Vitest v4.1.8 + Happy-DOM
- **Déploiement**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📁 Structure du Projet

```
edb-website/
├── src/
│   ├── assets/
│   │   └── images/          # Images optimisées avec Astro
│   ├── components/          # Composants Astro réutilisables
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── HomeJourney.astro
│   │   ├── About.astro
│   │   ├── Equipment.astro
│   │   ├── Beers.astro
│   │   ├── ReleasesTimeline.astro
│   │   ├── EventsAgenda.astro
│   │   ├── Process.astro
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   ├── SkipLinks.astro
│   │   └── BeerStructuredData.astro
│   ├── data/                # Données JSON
│   │   ├── beers.json
│   │   ├── equipment.json
│   │   ├── process.json
│   │   ├── releases.json
│   │   └── events.json
│   ├── layouts/
│   │   └── Layout.astro     # Layout principal
│   ├── pages/
│   │   ├── index.astro      # Page d'accueil
│   │   ├── cgv.md           # Conditions générales de vente
│   │   ├── mentions-legales.md
│   │   └── agenda/[id].ics.ts
│   ├── schemas/             # Schémas de validation Zod
│   │   ├── beer.schema.ts
│   │   ├── equipment.schema.ts
│   │   ├── process.schema.ts
│   │   ├── release.schema.ts
│   │   └── event.schema.ts
│   ├── styles/              # CSS organisé par composant
│   │   ├── global.css
│   │   ├── utilities.css    # Classes utilitaires
│   │   └── ...
│   └── utils/               # Fonctions utilitaires
│       ├── data-loader.ts   # Chargement et validation des données
│       ├── dom-helpers.ts   # Helpers DOM avec error handling
│       ├── quiz-engine.ts
│       └── ics.ts
├── public/                  # Assets statiques
├── dist/                    # Build output
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD pour GitHub Pages
├── astro.config.mjs         # Configuration Astro
├── vitest.config.ts         # Configuration des tests
├── tsconfig.json            # Configuration TypeScript
└── package.json
```

## 🛠️ Installation

### Prérequis

- Node.js v20+ (ou v22+ recommandé)
- npm v9.6.5+

### Installation des dépendances

```bash
npm install
```

## 📜 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement sur http://localhost:4321 |
| `npm run build` | Build de production dans le dossier `dist/` |
| `npm run preview` | Prévisualise le build de production localement |
| `npm test` | Lance les tests en mode watch |
| `npm run test:ui` | Lance l'interface UI de Vitest |
| `npm run test:run` | Lance les tests une seule fois |
| `npm run test:coverage` | Génère un rapport de couverture des tests |

## 🏗️ Développement

### Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:4321](http://localhost:4321).

### Modifier les données

Les données des bières, équipements et processus sont stockées dans des fichiers JSON dans `src/data/`. Ces données sont validées au runtime avec Zod.

**Exemple - Ajouter une nouvelle bière :**

1. Éditer `src/data/beers.json`
2. Ajouter un nouvel objet avec la structure suivante :

```json
{
  "id": "nouvelle-biere",
  "name": "Nom de la Bière",
  "type": "Type de Bière",
  "description": "Description de la bière...",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "abv": "X,X% alc.",
  "hasSpecialEffect": false,
  "hasGhosts": false
}
```

3. Le schéma Zod validera automatiquement les données au build

### Ajouter des images

1. Placer les images dans `src/assets/images/`
2. Importer l'image dans le composant :
   ```typescript
   import monImage from '../assets/images/mon-image.webp';
   ```
3. Utiliser le composant `<Image>` d'Astro :
   ```astro
   <Image src={monImage} alt="Description" width={280} height={280} />
   ```

Les images seront automatiquement optimisées au build.

## 🧪 Tests

Le projet utilise Vitest pour les tests unitaires.

### Lancer les tests

```bash
npm test
```

### Tests disponibles

- **data-loader.test.ts**: Tests de validation des données JSON
- **catalog-mapper.test.ts**: Tests de mapping du catalogue public
- **dom-helpers.test.ts**: Tests des helpers DOM

### Catalogue distant

Par défaut, tests et build locaux utilisent les fixtures locales. Les builds de
publication GitHub Pages utilisent le catalogue live :

```bash
CATALOG_SOURCE=live npm run build
```

Ce mode garde les tests et previews locales indépendants du Worker live.
En production, les fiches bières viennent du catalogue public publié par
BreweryManager et les images viennent du bucket R2
`https://assets.lecoledubelier.beer/images`.

Le contrat Zod `src/schemas/catalog.schema.ts` accepte :

- les contrats historiques v1 à v4 ;
- le contrat v5 séparé ;
- un modèle d'affichage commun.

Le site conserve chaque `id`, regroupe visuellement par `groupingKey` et garde
les versions de recette distinctes. Il n'affiche jamais les quantités exactes.
En v5, seul `stock.web` alimente le rendu.

Un build `CATALOG_SOURCE=live` échoue si le catalogue est inaccessible ou
invalide. La publication ne retombe jamais silencieusement sur les fixtures.

### Écrire de nouveaux tests

Créer un fichier `*.test.ts` à côté du fichier à tester :

```typescript
import { describe, it, expect } from 'vitest';

describe('Ma fonctionnalité', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

## 🎨 Styling

Le projet utilise du CSS vanilla avec des custom properties (variables CSS) pour le theming.

### Design System

Les variables CSS sont définies dans `src/styles/global.css` :

- **Couleurs**: `--primary`, `--bg`, `--fg`, etc.
- **Espacement**: `--space-1` à `--space-16`
- **Typography**: `--text-xs` à `--text-5xl`
- **Radius**: `--radius-sm` à `--radius-full`
- **Transitions**: `--duration-fast`, `--duration-normal`, `--duration-slow`

### Utility Classes

Des classes utilitaires sont disponibles dans `src/styles/utilities.css` :

- **Animations**: `.fade-in`, `.slide-in-left`, `.scale-in`
- **Layout**: `.container-narrow`, `.grid-auto-fit`, `.flex-center`
- **Cards**: `.card`, `.card-glass`
- **Buttons**: `.btn`, `.btn-primary`, `.btn-lg`

## ♿ Accessibilité

Le site respecte les standards WCAG 2.1 AA :

- ✅ Skip links pour la navigation au clavier
- ✅ Attributs ARIA appropriés
- ✅ Contraste de couleurs conforme
- ✅ Navigation au clavier complète
- ✅ Images avec alt text descriptif
- ✅ Structure sémantique HTML5

## 🔍 SEO

### Optimisations SEO implémentées

- ✅ Sitemap.xml généré automatiquement
- ✅ Données structurées JSON-LD (Organization, LocalBusiness, Products)
- ✅ Meta tags Open Graph
- ✅ Balises meta description et title optimisées
- ✅ URLs propres et sémantiques
- ✅ Performance optimale (images optimisées, CSS minifié)

### robots.txt

Un fichier `robots.txt` est présent dans le dossier `public/`.

## 📦 Build & Déploiement

### Build de production

```bash
npm run build
```

Le site sera généré dans le dossier `dist/` en version optimisée pour la production.

### Déploiement sur GitHub Pages

Le déploiement est automatique via GitHub Actions. À chaque push sur la branche `main`, le workflow :

1. Build le site avec Astro
2. Déploie sur GitHub Pages
3. Rend le site accessible sur https://lecoledubelier.beer

### Configuration du domaine custom

Le domaine `lecoledubelier.beer` est configuré via :
1. Un fichier `CNAME` dans le dossier `public/`
2. Configuration DNS chez le registrar pointant vers GitHub Pages

## 🔧 Configuration

### Astro Config

Le fichier `astro.config.mjs` contient :

```javascript
export default defineConfig({
  site: 'https://lecoledubelier.beer',
  integrations: [sitemap()],
  image: {
    domains: ['lecoledubelier.beer'],
  }
});
```

### TypeScript Config

Le projet utilise TypeScript en mode strict pour une meilleure qualité de code.

## 📝 Canal de Contact

Le site reste statique. Le formulaire d'alerte utilise FormSubmit par défaut,
via un POST HTML standard vers `https://formsubmit.co/<email>`.
Référence prestataire : https://formsubmit.co/documentation.

Configuration :

| Variable | Défaut | Usage |
|---|---|---|
| `PUBLIC_CONTACT_EMAIL` | adresse privée configurée | Destinataire privé et fallback FormSubmit |
| `PUBLIC_CONTACT_FORM_PROVIDER` | `FormSubmit` | Libellé affiché et label analytics |
| `PUBLIC_CONTACT_FORM_ENDPOINT` | `https://formsubmit.co/<PUBLIC_CONTACT_EMAIL>` | Endpoint POST du formulaire |
| `PUBLIC_CONTACT_FORM_REDIRECT_URL` | `https://lecoledubelier.beer/#contact` | URL absolue post-submit |
| `PUBLIC_CONTACT_FORM_CAPTCHA` | `true` | `false` ajoute `_captcha=false` |

Choix RGPD / anti-spam :

- Donnée personnelle collectée : email uniquement.
- Finalité affichée : prévenir des prochaines sorties.
- Prestataire : FormSubmit, à confirmer une première fois par email côté boîte destinataire.
- reCAPTCHA FormSubmit conservé par défaut.
- Honeypot `_honey` ajouté.
- Endpoint encodé dans le HTML, puis restauré côté navigateur.
- Adresse email jamais affichée aux visiteurs.
- Email retiré des données structurées JSON-LD.
- Redirection `_next` absolue configurée.
- `_url` renseigne la page source du formulaire.
- FormSubmit documente une rétention d'archive de soumissions de 30 jours.
- Après activation, utiliser l'endpoint aléatoire FormSubmit via
  `PUBLIC_CONTACT_FORM_ENDPOINT` pour retirer aussi l'adresse de la configuration publique.

Endpoints volontairement hardcodés :

- `https://lecoledubelier.beer` : URL canonique SEO, sitemap, robots, JSON-LD, événements internes.
- `https://schema.org/*` : vocabulaires JSON-LD publics.
- `https://brewery-catalog.the-school-of-the-ram.workers.dev/api/public-catalog.json` : fallback catalogue live, surchargé par `PUBLIC_CATALOG_URL`.
- `https://assets.lecoledubelier.beer/images` : fallback images R2, surchargé par `PUBLIC_IMAGE_HOST`.

## 🐛 Debugging

### Problèmes courants

**Les images ne se chargent pas :**
- Vérifier que les images sont dans `src/assets/images/`
- Vérifier l'import dans le composant
- Rebuild avec `npm run build`

**Erreur de validation Zod :**
- Vérifier le format des données dans les fichiers JSON
- Consulter les schémas dans `src/schemas/`

**Thème ne persiste pas :**
- Vérifier que le localStorage est accessible
- Vérifier le script inline dans `Layout.astro`

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Tous droits réservés © 2025 L'École du Bélier

## 📧 Contact

Pour toute question concernant le site web :
- Email : contact@lecoledubelier.beer
- Site : https://lecoledubelier.beer

---

**Construit avec ❤️ et 🍺 par l'équipe de L'École du Bélier**
