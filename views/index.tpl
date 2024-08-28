<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Browser</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <div id="app">
        <nav>
            <button id="votingBtn" class="active">Voting</button>
            <button id="breedsBtn">Breeds</button>
            <button id="favsBtn">Favs</button>
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

