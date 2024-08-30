<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Browser</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <div id="app">
        <nav>
            <button id="votingBtn" class="active"><span>&#8645;</span> Voting</button>
            <button id="breedsBtn"><i class="fas fa-search"></i> Breeds</button>
            <button id="favsBtn"><i class="fa-solid fa-heart"></i> Favs</button>
            <button id="votesBtn"><i class="fa-solid fa-check"></i> Voted</button> 
        </nav>

        <!-- Breed Search Container -->
        <div id="breedSelector" style="display: none;">
            <input type="text" id="breedSearch" placeholder="Search for breeds...">
            <ul id="breedList"></ul>
        </div>
     
        <div id="catCard">
            <div id="catContainer"></div>
            <div id="votingContainer">
                <button id="favoriteButton">❤️</button>
                <button id="likeButton">👍</button>
                <button id="dislikeButton">👎</button>
            </div>
        </div>

        <!-- Breed Info Display -->
        <div id="breedInfo"></div>
    </div>
    <script src="/static/js/main.js"></script>
</body>
</html>