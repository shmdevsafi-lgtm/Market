# SHM Marketplace

Une plateforme d'e-commerce moderne pour la vente de produits éducatifs, articles de scout, produits médicaux et services de personnalisation.

## Fonctionnalités Principales

- **Authentification sécurisée** : Inscription et connexion avec Supabase Auth
- **Rate Limiting** : Protection contre les attaques par brute force (5 tentatives, blocage 30 min)
- **Catalogue de produits** : Produits statiques et personnalisables stockés dans Supabase
- **Panier et Favoris** : Gestion complète du panier et des articles favoris
- **Intégration PayPal** : Paiements sécurisés via PayPal
- **Gestion des commandes** : Suivi des commandes utilisateur
- **Responsive Design** : Interface adaptée à tous les appareils
- **Donations** : Support des dons pour les causes spéciales

## Tech Stack

### Frontend
- **React 18** : Framework UI principal
- **React Router 6** : Routage SPA
- **TypeScript** : Typage statique
- **TailwindCSS 3** : Styles et design responsive
- **Radix UI** : Composants d'interface utilisateur
- **Vite** : Build tool performant

### Backend
- **Express.js** : Framework serveur Node.js
- **Supabase** : Base de données PostgreSQL + authentification
- **bcrypt** : Hachage sécurisé des mots de passe
- **Zod** : Validation de schémas TypeScript

### Tests & Qualité
- **Vitest** : Framework de tests unitaires
- **TypeScript** : Vérification des types

## Installation

### Prérequis
- Node.js 16+ 
- PNPM 7+
- Compte Supabase

### Setup Local

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Démarrer le serveur de développement
pnpm dev
```

L'application sera disponible sur `http://localhost:8080`

## Variables d'Environnement

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme

SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service

PAYPAL_CLIENT_ID=votre-client-id
PAYPAL_CLIENT_SECRET=votre-secret
PAYPAL_MODE=sandbox
```

## Structure du Projet

```
├── client/              # Frontend React
│   ├── pages/          # Pages/routes
│   ├── components/     # Composants réutilisables
│   ├── data/           # Données statiques
│   ├── services/       # Services API
│   ├── context/        # Context API (Auth, Cart, etc.)
│   └── lib/            # Utilitaires et configuration
├── server/             # Backend Express
│   ├── routes/         # Endpoints API
│   ├── middleware/     # Middlewares Express
│   └── lib/            # Utilitaires serveur
├── shared/             # Types partagés frontend/backend
└── sql/                # Documentation SQL
```

## Produits Disponibles

### Catégories Principales
- **Projets** : Services de projection et ateliers
- **BabySmile** : Produits éducatifs spécialisés
- **Donations** : Contributions caritatives

Les produits sont stockés dans deux tables Supabase :
- `static_products` : Produits avec configuration fixe
- `customizable_products` : Produits personnalisables

## Commandes Disponibles

```bash
# Développement
pnpm dev           # Démarrer le serveur de développement

# Build & Production
pnpm build         # Créer la build de production
pnpm start         # Démarrer le serveur de production

# Tests
pnpm test          # Exécuter les tests Vitest

# Vérification
pnpm typecheck     # Vérifier les types TypeScript
```

## Sécurité

- **Authentification** : JWT via Supabase Auth
- **Rate Limiting** : Protection contre le brute force (5 tentatives, 30 min)
- **HTTPS** : Obligatoire en production
- **CORS** : Configuration sécurisée
- **Validation** : Validation Zod côté serveur

## Déploiement

L'application peut être déployée sur :
- **Netlify** : Déploiement automatique via MCP
- **Vercel** : Déploiement automatique via MCP
- **Node.js Classique** : Serveur autohébergé

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Produits
- `GET /api/products` - Lister les produits
- `GET /api/products/:id` - Détail d'un produit

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/:id` - Détail d'une commande

### Utilisateur
- `GET /api/users/me` - Profil utilisateur
- `PUT /api/users/me` - Mettre à jour le profil

### Favoris
- `GET /api/favorites` - Lister les favoris
- `POST /api/favorites` - Ajouter aux favoris
- `DELETE /api/favorites/:productId` - Retirer des favoris

### Paiements
- `POST /api/paypal/order` - Créer une commande PayPal
- `POST /api/paypal/verify` - Vérifier une commande PayPal

## Contribution

Les contributions sont bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout de ...'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## Support

Pour toute question ou signalement de bug :
- Email : contact@shm.ma
- WhatsApp : wa.me/212675202336

## License

Propriétaire - Tous droits réservés

## Liens Utiles

- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
