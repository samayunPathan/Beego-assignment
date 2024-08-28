document.addEventListener('DOMContentLoaded', () => {
    const breedSearch = document.getElementById('breedSearch');
    const breedList = document.getElementById('breedList');
    const breedInfo = document.getElementById('breedInfo');
    const catContainer = document.getElementById('catContainer');
    const votingBtn = document.getElementById('votingBtn');
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
            <h3>${breed.name} (${breed.origin}) ${breed.id}</h3>
            <p>${breed.description || 'No description available.'}</p>
            <a href="${breed.wikipedia_url}" target="_blank">Wikipedia</a>
        `;
        await fetchCatByBreed(breed.id);
    };

    const fetchCatByBreed = async (breedId) => {
        try {
            const response = await fetch(`/breed-images/${breedId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const images = await response.json();
            
            if (images.length === 0) {
                console.error('No images found for the breed');
                return;
            }
            
            let currentImageIndex = 0;
    
            const displayImage = () => {
                const imageContainer = document.getElementById("catContainer");
                if (!imageContainer) {
                    console.error('Image container not found');
                    return;
                }
                imageContainer.innerHTML = ""; // Clear the container
    
                const img = document.createElement("img");
                img.src = images[currentImageIndex].url;
                img.width = 500; // Adjust the size as needed
                img.height = 375;
    
                imageContainer.appendChild(img);
    
                // Move to the next image
                currentImageIndex = (currentImageIndex + 1) % images.length;
            };
    
            displayImage();

            if (currentMode === 'breeds') {
                autoImageInterval = setInterval(displayImage, 3000);
            }

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
        if (currentMode === 'breeds') {
            votingContainer.style.display = 'none';
        } else {
            votingContainer.style.display = 'block';
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

        if (mode === 'voting') {
            fetchRandomCat();
        } else if (mode === 'breeds') {
            breedSelector.style.display = 'block';
            catContainer.innerHTML = '';
            breedInfo.innerHTML = '';
            updateBreedList();
        }
    };

    votingBtn.addEventListener('click', () => {
        setMode('voting');
        breedSelector.style.display = 'none';
        breedInfo.innerHTML = '';
    });

    breedsBtn.addEventListener('click', () => {
        setMode('breeds');
        breedSelector.style.display = 'block';
    });

    favsBtn.addEventListener('click', () => {
        setMode('favs');
        breedSelector.style.display = 'none';
        breedInfo.innerHTML = '';
        fetchRandomCat();
    });

    breedSearch.addEventListener('input', updateBreedList);

    const handleVote = async (voteType) => {
        if (currentCatId) {
            try {
                await fetch(`/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ catId: currentCatId, vote: voteType })
                });
                if (currentMode === 'voting') {
                    fetchRandomCat();
                }
            } catch (error) {
                console.error('Error voting:', error);
            }
        }
    };

    favoriteButton.addEventListener('click', async () => {
        if (currentCatId) {
            try {
                await fetch(`/favorite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ catId: currentCatId })
                });
                if (currentMode === 'voting') {
                    fetchRandomCat();
                }
            } catch (error) {
                console.error('Error adding to favorites:', error);
            }
        }
    });

    likeButton.addEventListener('click', () => handleVote('like'));

    dislikeButton.addEventListener('click', () => handleVote('dislike'));

    // Initial setup
    fetchBreeds().then(() => {
        setMode('voting');
    });
});


