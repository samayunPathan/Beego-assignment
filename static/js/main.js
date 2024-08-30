document.addEventListener('DOMContentLoaded', () => {
    const breedSearch = document.getElementById('breedSearch');
    const breedList = document.getElementById('breedList');
    const breedInfo = document.getElementById('breedInfo');
    const catContainer = document.getElementById('catContainer');
    const votingBtn = document.getElementById('votingBtn');
    const votesBtn = document.getElementById('votesBtn');
    const breedsBtn = document.getElementById('breedsBtn');
    const favsBtn = document.getElementById('favsBtn');
    const breedSelector = document.getElementById('breedSelector');
    const favoriteButton = document.getElementById('favoriteButton');
    const likeButton = document.getElementById('likeButton');
    const dislikeButton = document.getElementById('dislikeButton');
    const votingContainer = document.getElementById('votingContainer');

    let breeds = [];
    let currentMode = 'voting';
    let currentCatId = null;
    let currentBreed = null;
    let autoImageInterval = null;
    let favorites = [];
    let votes = [];

    const fetchBreeds = async () => {
        try {
            const response = await fetch('/breeds');
            breeds = await response.json();
        } catch (error) {
            console.error('Error fetching breeds:', error);
        }
    };

    const updateBreedList = () => {
        const searchTerm = breedSearch.value.toLowerCase();
        const filteredBreeds = breeds.filter(breed =>
            breed.name.toLowerCase().includes(searchTerm)
        );

        breedList.innerHTML = '';
        filteredBreeds.forEach(breed => {
            const li = document.createElement('li');
            li.textContent = `${breed.name} (${breed.origin})`;
            li.addEventListener('click', () => selectBreed(breed));
            breedList.appendChild(li);
        });

        breedList.style.display = filteredBreeds.length > 0 ? 'block' : 'none';
    };

    const selectBreed = async (breed) => {
        currentBreed = breed;
        breedSearch.value = breed.name;
        breedList.style.display = 'none';
        breedInfo.innerHTML = `
            <h3>${breed.name}  (${breed.origin})  ${breed.id}</h3>
            <p>${breed.description || 'No description available.'}</p>
            <a href="${breed.wikipedia_url}" target="_blank">Wikipedia</a>
        `;
        await fetchCatByBreed(breed.id);
    };

    const fetchCatByBreed = async (breedId) => {
        try {
            const response = await fetch(`/breed-images/${breedId}`);
            const images = await response.json();

            if (images.length === 0) {
                console.error('No images found for the breed');
                return;
            }

            displayImage(images, 'breeds');
        } catch (error) {
            console.error('Error fetching cat by breed:', error);
        }
    };

    const fetchRandomCat = async () => {
        try {
            const response = await fetch('/random-cat');
            const cat = await response.json();
            currentCatId = cat.id;
            displayCat(cat);
        } catch (error) {
            console.error('Error fetching random cat:', error);
        }
    };

    const displayCat = (cat) => {
        catContainer.innerHTML = `<img src="${cat.url}" alt="Cat">`;
        currentCatId = cat.id;
        updateButtonVisibility();
    };

    const updateButtonVisibility = () => {
        votingContainer.style.display = currentMode === 'breeds' ? 'none' : 'block';
    };

    const addFavorite = async (catId) => {
        try {
            await fetch('/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catId: catId })
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const response = await fetch('/favorites');
            favorites = await response.json();
            if (favorites.length > 0) {
                displayImage(favorites, 'favorites');
            } else {
                catContainer.innerHTML = '<p>No favorites yet!</p>';
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const deleteFavorite = async (favoriteId) => {
        try {
            await fetch(`/favorites/delete/${favoriteId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting favorite:', error);
        }
    };

    const voteForCat = async (imageId, isUpvote) => {
        try {
            await fetch('/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_id: imageId,
                    value: isUpvote,
                    sub_id: 'demo-samayun'
                })
            });
        } catch (error) {
            console.error('Error voting for cat:', error);
        }
    };

    const fetchVotes = async () => {
        try {
            const response = await fetch('/votes');
            votes = await response.json();
            if (votes.length > 0) {
                displayImage(votes, 'votes');
            } else {
                catContainer.innerHTML = '<p>No votes yet!</p>';
            }
        } catch (error) {
            console.error('Error fetching votes:', error);
        }
    };

    const displayImage = (items, type) => {
        let currentIndex = 0;

        const showImage = () => {
            const item = items[currentIndex];
            const imageUrl = item.image ? item.image.url : item.url;
            let extraContent = '';

            if (type === 'favorites') {
                extraContent = `
                <button class="delete-favorite" data-id="${item.id}"style="
                color: red; 
                border:none;
                border-radius: 10px; 
                padding:5px;
                font-size: 17px; 
                align-items: center; 
                cursor: pointer;
                justify-content: center; 
            ">🗑️ Remove</button>
                `;
            } else if (type === 'votes') {
                const voteValue = item.value === 1 ? 'UpVote 👍' : 'DownVote 👎';
                extraContent = `<div style ="margin-top: 20px; text-align: center;"><p>${voteValue}</p></div>`;
            }

            catContainer.innerHTML = `<div class="image-container" style="margin-top: 20px; text-align: center;">
                <img src="${imageUrl}" alt="Cat Image" width="500" height="375" style="border: 1px solid #ccc; border-radius: 10px;">
                <div class="image-sidebar" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 10px;">
                    <button class="prev-image" style="padding: 5px 10px; font-size: 14px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;">❮</button>
                    ${extraContent}
                    <button class="next-image" style="padding: 5px 10px; font-size: 14px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;">❯</button>
                </div>
            </div>
        `;
            currentCatId = item.image ? item.image.id : item.id;

            document.querySelector('.delete-favorite')?.addEventListener('click', async (event) => {
                const favoriteId = event.target.getAttribute('data-id');
                await deleteFavorite(favoriteId);
                fetchFavorites();
            });

            document.querySelector('.prev-image').addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                showImage();
            });

            document.querySelector('.next-image').addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % items.length;
                showImage();
            });
        };

        showImage();

        if (type === 'breeds' || type === 'votes') {
            autoImageInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % items.length;
                showImage();
            }, 3400);
        }
    };

    const setMode = (mode) => {
        currentMode = mode;
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}Btn`).classList.add('active');

        updateButtonVisibility();

        if (autoImageInterval) {
            clearInterval(autoImageInterval);
            autoImageInterval = null;
        }
        catContainer.style.display = 'block';
        breedSelector.style.display = 'none';
        breedInfo.style.display = 'none';
        votingContainer.style.display = 'none';

        if (mode === 'voting') {
            fetchRandomCat();
        } else if (mode === 'breeds') {
            breedSelector.style.display = 'block';
            breedInfo.style.display = 'block';
            updateBreedList();
        } else if (mode === 'favs') {
            fetchFavorites();
        } else if (mode === 'votes') {
            fetchVotes();
        }
    };

    votingBtn.addEventListener('click', () => setMode('voting'));
    breedsBtn.addEventListener('click', () => setMode('breeds'));
    favsBtn.addEventListener('click', () => setMode('favs'));
    votesBtn.addEventListener('click', () => setMode('votes'));

    breedSearch.addEventListener('input', updateBreedList);

    const handleVote = async (voteType) => {
        if (currentCatId) {
            await voteForCat(currentCatId, voteType === 'like');
            if (currentMode === 'voting') {
                fetchRandomCat();
            }
        }
    };

    favoriteButton.addEventListener('click', async () => {
        if (currentCatId) {
            await addFavorite(currentCatId);
            if (currentMode === 'voting') {
                fetchRandomCat();
            }
        }
    });

    likeButton.addEventListener('click', () => handleVote('like'));
    dislikeButton.addEventListener('click', () => handleVote('dislike'));

    fetchBreeds();
    setMode('voting');
});
