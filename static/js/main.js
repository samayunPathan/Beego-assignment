// document.addEventListener('DOMContentLoaded', () => {
//     const breedSearch = document.getElementById('breedSearch');
//     const breedList = document.getElementById('breedList');
//     const breedInfo = document.getElementById('breedInfo');
//     const catContainer = document.getElementById('catContainer');
//     const votingBtn = document.getElementById('votingBtn');
//     const votesBtn = document.getElementById('votesBtn');
//     const breedsBtn = document.getElementById('breedsBtn');
//     const favsBtn = document.getElementById('favsBtn');
//     const breedSelector = document.getElementById('breedSelector');
//     const favoriteButton = document.getElementById('favoriteButton');
//     const likeButton = document.getElementById('likeButton');
//     const dislikeButton = document.getElementById('dislikeButton');
//     const votingContainer = document.getElementById('votingContainer');


//     let breeds = [];
//     let currentMode = 'voting';
//     let currentCatId = null;
//     let currentBreed = null;
//     let autoImageInterval = null;
//     let favorites = [];
//     let votes = [];


//     const fetchBreeds = async () => {
//         try {
//             const response = await fetch('/breeds');
//             breeds = await response.json();
//         } catch (error) {
//             console.error('Error fetching breeds:', error);
//         }
//     };

//     const updateBreedList = () => {
//         const searchTerm = breedSearch.value.toLowerCase();
//         const filteredBreeds = breeds.filter(breed =>
//             breed.name.toLowerCase().includes(searchTerm)
//         );

//         breedList.innerHTML = '';
//         filteredBreeds.forEach(breed => {
//             const li = document.createElement('li');
//             li.textContent = `${breed.name} (${breed.origin})`;
//             li.addEventListener('click', () => selectBreed(breed));
//             breedList.appendChild(li);
//         });

//         breedList.style.display = filteredBreeds.length > 0 ? 'block' : 'none';
//     };

//     const selectBreed = async (breed) => {
//         currentBreed = breed;
//         breedSearch.value = breed.name;
//         breedList.style.display = 'none';
//         breedInfo.innerHTML = `
//             <h3>${breed.name} (${breed.origin}) ${breed.id}</h3>
//             <p>${breed.description || 'No description available.'}</p>
//             <a href="${breed.wikipedia_url}" target="_blank">Wikipedia</a>
//         `;
//         await fetchCatByBreed(breed.id);
//     };

//     const fetchCatByBreed = async (breedId) => {
//         try {
//             const response = await fetch(`/breed-images/${breedId}`);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             const images = await response.json();

//             if (images.length === 0) {
//                 console.error('No images found for the breed');
//                 return;
//             }

//             let currentImageIndex = 0;

//             const displayImage = () => {
//                 const imageContainer = document.getElementById("catContainer");
//                 if (!imageContainer) {
//                     console.error('Image container not found');
//                     return;
//                 }
//                 imageContainer.innerHTML = "";

//                 const img = document.createElement("img");
//                 img.src = images[currentImageIndex].url;
//                 img.width = 500;
//                 img.height = 375;

//                 imageContainer.appendChild(img);

//                 currentImageIndex = (currentImageIndex + 1) % images.length;
//             };

//             displayImage();

//             if (currentMode === 'breeds') {
//                 autoImageInterval = setInterval(displayImage, 3000);
//             }

//         } catch (error) {
//             console.error('Error fetching cat by breed:', error);
//         }
//     };

//     const fetchRandomCat = async () => {
//         try {
//             const response = await fetch('/random-cat');
//             const cat = await response.json();
//             currentCatId = cat.id;
//             displayCat(cat);
//         } catch (error) {
//             console.error('Error fetching random cat:', error);
//         }
//     };

//     const displayCat = (cat) => {
//         catContainer.innerHTML = `<img src="${cat.url}" alt="Cat">`;
//         currentCatId = cat.id;
//         updateButtonVisibility();
//     };

//     const updateButtonVisibility = () => {
//         if (currentMode === 'breeds') {
//             votingContainer.style.display = 'none';
//         } else {
//             votingContainer.style.display = 'block';
//         }
//     };

//     const addFavorite = async (catId) => {
//         try {
//             const response = await fetch('/favorite', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ catId: catId })
//             });
//             const result = await response.json();
//             console.log(result.message || 'Favorite added successfully');
//         } catch (error) {
//             console.error('Error adding favorite:', error);
//         }
//     };

//     const fetchFavorites = async () => {
//         try {
//             const response = await fetch('/favorites');
//             favorites = await response.json();
//             console.log('Fetched favorites:', favorites);
//             if (favorites.length > 0) {
//                 displayFavorites(favorites);
//             } else {
//                 catContainer.innerHTML = '<p>No favorites yet!</p>';
//             }
//         } catch (error) {
//             console.error('Error fetching favorites:', error);
//         }
//     };
    
// z

//     const displayFavorites = (favorites) => {
//         if (favorites.length === 0) {
//             catContainer.innerHTML = '<p>No favorites yet!</p>';
//             return;
//         }
    
//         let currentFavoriteIndex = 0;
    
//         const displayFavoriteImage = () => {
//             const favorite = favorites[currentFavoriteIndex];
//             catContainer.innerHTML = `
//                 <div class="image-container">
//                     <img src="${favorite.image.url}" alt="Favorite Cat" class="favorite-image" width="500" height="375">
//                     <div class="image-sidebar">
//                         <button class="prev-favorite">❮ Prev</button>
//                         <button class="delete-favorite" data-id="${favorite.id}">🗑️ Remove</button>
//                         <button class="next-favorite">Next ❯</button>
//                     </div>
//                 </div>
//             `;
//             currentCatId = favorite.image.id;
    
//             const deleteButton = document.querySelector('.delete-favorite');
//             deleteButton.addEventListener('click', async (event) => {
//                 const favoriteId = event.target.getAttribute('data-id');
//                 await deleteFavorite(favoriteId);
//                 fetchFavorites(); // Refresh favorites list
//             });
    
//             const prevButton = document.querySelector('.prev-favorite');
//             const nextButton = document.querySelector('.next-favorite');
    
//             prevButton.addEventListener('click', () => {
//                 currentFavoriteIndex = (currentFavoriteIndex - 1 + favorites.length) % favorites.length;
//                 displayFavoriteImage();
//             });
    
//             nextButton.addEventListener('click', () => {
//                 currentFavoriteIndex = (currentFavoriteIndex + 1) % favorites.length;
//                 displayFavoriteImage();
//             });
//         };
    
//         displayFavoriteImage();
//     };
    
    
//     const deleteFavorite = async (favoriteId) => {
//         try {
//             const response = await fetch(`/favorites/delete/${favoriteId}`, {
//                 method: 'DELETE',
//             });
//             if (!response.ok) {
//                 throw new Error(`Failed to delete favorite with ID ${favoriteId}`);
//             }
//             console.log(`Deleted favorite with ID ${favoriteId}`);
//         } catch (error) {
//             console.error('Error deleting favorite:', error);
//         }
//     };
    
//     // for vote 

//     const voteForCat = async (imageId, isUpvote) => {
//         try {
//             const response = await fetch('/vote', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     image_id: imageId,
//                     value: isUpvote,
//                     sub_id: 'demo-samayun'
//                 })
//             });

//             const result = await response.json();
//             console.log('Vote result:', result);
//         } catch (error) {
//             console.error('Error voting for cat:', error);
//         }
//     };

//     const fetchVotes = async () => {
//         try {
//             const response = await fetch('/votes');
//             const votes = await response.json();
//             console.log('Fetched votes:', votes);
//             if (votes.length > 0) {
//                 displayVotes(votes);
//             } else {
//                 catContainer.innerHTML = '<p>No votes yet!</p>';
//             }
//         } catch (error) {
//             console.error('Error fetching votes:', error);
//         }
//     };

//     const displayVotes = (votes) => {
//         if (votes.length === 0) {
//             catContainer.innerHTML = '<p>No votes yet!</p>';
//             return;
//         }

//         let currentVoteIndex = 0;

//         const displayVoteImage = () => {
//             const vote = votes[currentVoteIndex];
//             const voteValue = vote.value === 1 ? ' UpVote 👍' : ' DownVote 👎';
//             catContainer.innerHTML = `
//                 <div>
//                     <img src="${vote.image.url}" alt="Favorite Cat" width="500" height="375">
//                     <p>${voteValue}</p>
//                 </div>
//             `;
//             currentCatId = vote.image.id;

//             currentVoteIndex = (currentVoteIndex + 1) % votes.length;
//         };

//         displayVoteImage();

//         if (currentMode === 'votes') {
//             autoImageInterval = setInterval(displayVoteImage, 3000);
//         }
//     };

//     /// end for vote 

//     const setMode = (mode) => {
//         currentMode = mode;
//         document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
//         document.getElementById(`${mode}Btn`).classList.add('active');

//         updateButtonVisibility();

//         if (autoImageInterval) {
//             clearInterval(autoImageInterval);
//             autoImageInterval = null;
//         }
//         catContainer.style.display = 'block';
//         breedSelector.style.display = 'none';
//         breedInfo.style.display = 'none';
//         votingContainer.style.display = 'none';

//         if (mode === 'voting') {
//             fetchRandomCat();

//         } else if (mode === 'breeds') {
//             breedSelector.style.display = 'block';
//             breedInfo.style.display = 'block';

//             updateBreedList();
//         } else if (mode === 'favs') {
//             fetchFavorites();
//         } else if (mode === 'votes') {
//             fetchVotes();
//         }
//     };

//     votingBtn.addEventListener('click', () => setMode('voting'));
//     breedsBtn.addEventListener('click', () => setMode('breeds'));
//     favsBtn.addEventListener('click', () => setMode('favs'));
//     votesBtn.addEventListener('click', () => setMode('votes')); // Add this line

//     breedSearch.addEventListener('input', updateBreedList);

//     const handleVote = async (voteType) => {
//         if (currentCatId) {
//             try {
//                 await fetch(`/vote`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ catId: currentCatId, vote: voteType })
//                 });
//                 if (currentMode === 'voting') {
//                     fetchRandomCat();
//                 }
//             } catch (error) {
//                 console.error('Error voting:', error);
//             }
//         }
//     };

//     favoriteButton.addEventListener('click', async () => {
//         if (currentCatId) {
//             await addFavorite(currentCatId);
//             if (currentMode === 'voting') {
//                 fetchRandomCat();
//             }
//         }
//     });

//     likeButton.addEventListener('click', () => handleVote('like'));
//     dislikeButton.addEventListener('click', () => handleVote('dislike'));

//     fetchBreeds().then(() => {
//         setMode('voting');
//     });
// });






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
            <h3>${breed.name} (${breed.origin})</h3>
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
                    <button class="delete-favorite" data-id="${item.id}">🗑️ Remove</button>
                `;
            } else if (type === 'votes') {
                const voteValue = item.value === 1 ? 'UpVote 👍' : 'DownVote 👎';
                extraContent = `<p>${voteValue}</p>`;
            }

            catContainer.innerHTML = `
                <div class="image-container">
                    <img src="${imageUrl}" alt="Cat Image" class="favorite-image" width="500" height="375">
                    <div class="image-sidebar">
                        <button class="prev-image">❮ Prev</button>
                        ${extraContent}
                        <button class="next-image">Next ❯</button>
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
            }, 7000);
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
