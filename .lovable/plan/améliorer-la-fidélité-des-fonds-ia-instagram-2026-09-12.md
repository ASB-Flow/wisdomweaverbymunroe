# Améliorer la fidélité des fonds IA Instagram

## Objectif
Faire de la description visuelle de chaque section la consigne principale, afin que l’image générée reproduise précisément la scène demandée plutôt qu’une ambiance générique.

## Modifications
- Reformuler la consigne envoyée au générateur pour imposer le sujet, la composition, les attitudes et le point de vue décrits.
- Conserver une zone lisible pour le texte sans supprimer ni affaiblir le sujet principal.
- Garantir la représentation de personnes noires lorsqu’une scène humaine est demandée.
- Adapter la consigne au service d’image de secours actuellement utilisé.
- Vérifier la fonction et son comportement après modification.

## Détail technique
La description `imageIdea` sera placée en tête du prompt comme exigence obligatoire. Le prompt distinguera clairement sujet, composition, style et contraintes négatives, au lieu de traiter la scène comme une simple suggestion.
