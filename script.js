//Endpoints et ids
//================
let filter1 = ["&sort_by=-imdb_score", "Films les mieux notés", "best-movies"];   //Best Movies
let filter2 = ["&country=France&country_contains=France&lang=&lang_contains=french&sort_by=-imdb_score", "Meilleurs films français", "best-french-movies"];   // Best french movies
let filter3 = ["&year=2020&sort_by=-imdb_score", "Les succès à l'international de cette année", "best-2020-movies"];  // Best 2020 movies
let filter4 = ["&year=2020&country=France&country_contains=France&lang=&lang_contains=french", "Les tendances françaises de cette année", "best-2020-french-movies"];
let filter5 = ["&actor=jean-paul+belmondo", "Hommage à Belmondo", "belmondo"];
let filters = [filter1, filter2, filter3, filter4, filter5];

const baseURL = "http://localhost:8000/api/v1/titles/";

// Nombre de films dans chaque catégorie
// =====================================
let nbMovieToAdd = 7;

// Calcul du nombre de pages qu'il va falloir explorer en fonction du nombre de films à ajouter
// ==============================================================================================
function totalPages(totalMovies){
    const numberPerPages = 5;
    let totalPages = 1 + (totalMovies - totalMovies % numberPerPages)/numberPerPages;
    return totalPages
} 

// Ajout du film le mieux noté
// ===========================
function addBestMovie(json){
    console.log("Le film le mieux noté va être ajouté");
    let reponse = document.getElementById('the-best-movie');
    let reponse2 = document.getElementById('the-best-movie-image');
    let img = document.createElement('img');
    img.setAttribute('id', 'best-movie-image');
    document.body.append(reponse);
    img.src = json.results[0].image_url;
    reponse2.append(img);
    console.log(json.results[0]);
}

// Ajout des films par catégorie
// =============================
function addMovies(listFilms, category, id){
    console.log("Plusieurs films de la catégorie " + `${category}` +" vont être ajoutés");
    let div = document.createElement('div');
    div.innerHTML = "<h2> " + category +  " </h2>";
    div.innerHTML += "<span>&#139"+";</span>";
    div.innerHTML += "<span>&#155"+";</span>";
    div.setAttribute('id', id);
    let section = document.createElement('section');
    section.setAttribute('id', 'container');

    document.body.append(div);
    console.log(listFilms)
    
    for (let film of listFilms){
        let img = document.createElement('img');
        let filmId = film.id;
        img.setAttribute('id', filmId);
        img.setAttribute('onClick', "reply_click(this.id)");
        img.setAttribute('class', 'movie-img');
        img.src = film.image_url;
        section.appendChild(img);
        div.append(section);
    }
}

// Récupération de tous les films en json dans une liste
// =====================================================
async function fetchDatas(nbOfMoviesToAdd, totalPages, filter){
    let currentPage = 0;
    let numberToAdd = 0;
    let nbAdded = 0;    
    let morePagesAvailable = true;
    let allMovies = [];

    while(morePagesAvailable){
        currentPage++;
        // console.log("analyse de la page " + `${currentPage}`);
        let url = `${baseURL}` + "?page=" + `${currentPage}` + `${filter}`;
        // console.log(url);
        let reponse = await fetch(url);
        let reponse2 = await reponse.json();
        let movies = await reponse2.results;
        let nbPerPage = await movies.length;
        let totalMovies = await(movies.count);
                
        if (currentPage == totalPages){
            if(totalMovies < nbOfMoviesToAdd){
                numberToAdd = totalMovies - nbAdded;
                console.log(numberToAdd);
            } else {
                numberToAdd = nbOfMoviesToAdd - nbAdded;
            }
        } else {
            numberToAdd = nbPerPage;
            nbAdded = numberToAdd;
            // console.log(numberToAdd);
        }
        
        for (let i = 0; i < numberToAdd; i++){
            allMovies.push(movies[i]);
        }
        // console.log(allMovies);
        morePagesAvailable = currentPage < totalPages;     
    }
    return allMovies;
}

// Création de la modale
// =====================
async function openModal(json){
    let titre = json.title;
    let img = json.image_url;
    let genre = json.genres;
    let date = json.date_published;
    let rated = json.rated ;
    let imdbScore = json.imdb_score ;
    let real = json.directors;
    let actors = json.actors;
    let duration = json.duration;
    let country = json.countries;
    let boxOffice = json.usa_gross_income;
    let summary = json.long_description;

    inModal.innerHTML = `<img src=${img}> </img>`;
    inModal.innerHTML += `<h1> Titre : ${titre} </h1>`;
    inModal.innerHTML += `<p> Genre : ${genre} </p>`;
    inModal.innerHTML += `<p> Date de sortie : ${date} </p>`;
    inModal.innerHTML += `<p> Rated : ${rated} </p>`;
    inModal.innerHTML += `<p> Note IMDb : ${imdbScore} </p>`;
    inModal.innerHTML += `<p> Réalisateur : ${real} </p>`;
    inModal.innerHTML += `<p> Casting : ${actors} </p>`;
    inModal.innerHTML += `<p> Durée : ${duration} min</p>`;
    inModal.innerHTML += `<p> Pays : ${country} </p>`;
    inModal.innerHTML += `<p> Résultat box-office : ${boxOffice} </p>`;
    inModal.innerHTML += `<p> Résumé détaillé : ${summary} </p>`;
    
}

// Main
// ====
let numberPages = totalPages(nbMovieToAdd);

fetch("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score")    
    .then(reponse => reponse.json())
    .then(addBestMovie)

for (let filter of filters){
    fetchDatas(nbMovieToAdd, numberPages, filter[0])
    .then(function(films){
        addMovies(films, filter[1], filter[2]);
    });
}

// Gestion de la modale
// ====================
let modal = document.getElementById('myModal');
let button = document.getElementById("button1");
let closeButton = document.getElementsByClassName("close")[0];
let inModal = document.getElementsByClassName('modal-body')[0];

// Gestion du clic sur le bouton
// =============================
button.onclick = async function() {
    modal.style.display = "block";
    let reponse3 = await fetch("http://localhost:8000/api/v1/titles/1508669");
    let reponse4 = await reponse3.json();
    await openModal(reponse4);
}

// Gestion du clic sur les affiches
// ================================
async function reply_click(clicked_id)
{
    modal.style.display = "block";
    let movieUrl = `${baseURL}` + clicked_id;
    let reponse = await fetch(movieUrl);
    let reponse2 = await reponse.json();
    await openModal(reponse2);
}

closeButton.onclick = function() {
    modal.style.display = "none";
  }
