# Photos à produire — héros des zones Evere, Uccle, Forest, Woluwe-St-Lambert, Zaventem

Ces 5 pages zones utilisent aujourd'hui des photos génériques (`depanneuse-helpcar`, `depannage-voiture`) ou recyclées d'une autre zone (`remorquage-voiture-bruxelles-centre` sur Forest). Déposer les fichiers dans `images/` avec **exactement ces noms** (jpg ou png, peu importe la taille — conversion webp + version mobile `-md` faite au branchement). Ensuite, demander à Claude de les brancher.

| Fichier cible | Usage | Prompt |
|---|---|---|
| `evere-hero.jpg` | Hero page Evere (FR + NL) | Photo réaliste d'une dépanneuse à plateau orange et blanche chargeant une citadine grise le long d'une avenue bruxelloise moderne à Evere, immeubles de bureaux vitrés et alignement de drapeaux au loin côté OTAN, rails de tram et pelouses d'avenue Léopold III, ciel voilé belge, gyrophares orange allumés, style photo documentaire, 1200×800 |
| `uccle-hero.jpg` | Hero page Uccle (FR + NL) | Dépanneuse à plateau orange et blanche intervenant dans une rue résidentielle cossue d'Uccle, villas quatre façades et haies taillées, break familial premium à moitié chargé sur le plateau, grands arbres de la chaussée de Waterloo en arrière-plan, lumière douce de matinée, photo réaliste, 1200×800 |
| `forest-hero.jpg` | Hero page Forest (FR + NL) | Dépanneuse à plateau orange et blanche chargeant une berline compacte devant une salle de concert moderne au toit arrondi type Forest National, affiches de concert floues, rue en pente typique de Forest avec maisons bruxelloises en briques, fin de journée, gyrophares allumés, photo réaliste style reportage, 1200×800 |
| `woluwe-saint-lambert-hero.jpg` | Hero page Woluwe-St-Lambert (FR + NL) | Dépanneur en gilet fluo orange branchant un booster sur un SUV familial garé le long du boulevard de la Woluwe, berges vertes et immeubles résidentiels années 70 en arrière-plan, piste cyclable et arrêt de métro flou au loin, ciel clair belge, photo réaliste prise au smartphone, 1200×800 |
| `zaventem-hero.jpg` | Hero page Zaventem (FR + NL) | Photo réaliste d'une dépanneuse à plateau orange et blanche chargeant une berline de location devant un terminal d'aéroport moderne en verre, un avion en approche dans le ciel, panneaux de dépose-minute flous, valises sur un chariot au second plan, matin lumineux, style photo documentaire, 1200×800 |

**Conseils de cohérence** avec les photos existantes du site : pas de texte lisible inventé sur les véhicules ni les bâtiments, uniformes orange/gris, plaques d'immatriculation floutées ou européennes génériques, ambiance Belgique (briques, verdure, ciel voilé).

Une fois les fichiers déposés à la racine ou dans `images/`, Claude fait : conversion webp + `-md`, EXIF (description locale + auteur + copyright), branchement dans le hero de chaque page FR et NL, alt optimisé.
