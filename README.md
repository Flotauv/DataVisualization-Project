# DataVisualization-Project

## Informations

- Création d'un site web via html/css sur les crimes et délits en Auvergne Rhône Alpes de 2016 à 2024.  
Les graphiques sont réalisés grâce à la librairie D3.js

- Les données récoltées proviennent de  [data.gouv](https://www.data.gouv.fr/datasets/bases-statistiques-communale-departementale-et-regionale-de-la-delinquance-enregistree-par-la-police-et-la-gendarmerie-nationales/) une plateforme open source du gouvernement français.  
- L'objectif est de pouvoir expliquer ou exposer des faits sur les actes de délinquance en Auvergne Rhône Alpes

## Organisation

- **Index.html** : Page d'accueil du site qui pose le contexte.

- **Carte.html** : Carte de la région Auvergne Rhône Alpes avec le ration délits/crimes par région colorée selon l'échelle de couleur.  
Le slider permet de voir l'évolution de ce ration sur toute la région pour les différents départements qui l'a constitue.  
La carte est intéractive

- **Carte2.html** : Section graphique en barres inclinées comportant le nombre de  délits et de crimes de la region choisie sur la carte.  
Le slider permet de naviguer suivant les années pour voir l'évolution des délits/crimes la région.

- **Carte3.html** : 

- **main.js** : Fichier javascript  de développement des caractéristiques visibles sur le site.

Les données sont chargées via le package Paparse.js dès que l'utilisateur clique sur un nouveau département, une nouvelle année sur le slider, un bouton ...

### Dockerfile 

````
docker build . -t my_container_image_name

docker run --rm --name myapache -d -p 8080:80 my_container_image_name
````

## Fonctions

- **UpdateMap(selectedYear)** : Fonction permettant de construire carte.html suivant l'année selectionnée.  

- **setActive(element)** : Fonction permettant d'attribuer à un bouton le statut 'active' et ainsi générer le graphique correspondant sur Carte2.html

- **CreateBarChart(data)** : Fonction permettant de générer un graphique en barres horizontales suivant les données de l'argument data.

- **UpdateChart(selectedYear,code_dpt,isDelit)** : Fonction permettant de mettre à jour le graphique suivant les informations telles que l'année choisie, le département de Carte.html et le bouton cliqué (Délit/Crime).

## Documentation

[1] ["Create beautiful Bar Charts with D3.js "](https://www.youtube.com/watch?v=sTOHoueLVJE&list=TLPQMjExMDIwMjXFgC447sMm4w&index=3) 

[2] ["Github de datavizdad"](https://github.com/datavizdad/d3barchartseries/blob/main/script.js). 

[3] ["Best way to include your html javascript files into your html code"](https://www.youtube.com/watch?v=d14vAVDCxEg)

[4] ["Chartre graphique police nationale"](https://www.indre-et-loire.gouv.fr/content/download/27640/182461/fileNouvelle%20charte%20graphique%20des%20services%20de%20l'Etat.pdf). 

[5] ["Le summun du cool : transition entre pages avec Barba.js!"](https://youtu.be/AqPszQw4B5k?si=RsaYHnvTxBmGqTNM)


## Contacts

Matis Jean :  
Leo Delpech :   
Florent Saunier : florent.saunier13@gmail.com
## To Do (à supprimer )

- epuration contexte
- faire analyse de ce qu'on fait lol => remplacer l'onglet sources par un truc du style conclusion 
- connection flèche carte2 (flo)
- Legende carte à rajouter (léo)
- Page 3 bulle pour les sous cat , graphique bulle  pour les sous délits , les axes :  y le pourcentage du sous délit par apport aux délits totaux du departement  x : pourcentage par apport à la region pour la categorie  



