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
            <h2>${breed.name} (${breed.origin})</h2>
            <p>${breed.description || 'No description available.'}</p>
        `;
        await fetchCatByBreed(breed.id);
    };

    const fetchCatByBreed = async (breedId) => {
        try {
            // Corrected route to match your server-side Go route
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
    
            // Function to display the current image
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
    
            // Display the first image immediately
            displayImage();
    
            // Change the image every 3 seconds
            setInterval(displayImage, 3000);
    
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
        votingContainer.style.display = 'block';
    };

    const setMode = (mode) => {
        currentMode = mode;
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}Btn`).classList.add('active');
    };

    votingBtn.addEventListener('click', () => {
        setMode('voting');
        breedSelector.style.display = 'none';
        breedInfo.innerHTML = '';
        fetchRandomCat();
    });

    breedsBtn.addEventListener('click', () => {
        setMode('breeds');
        breedSelector.style.display = 'block';
        catContainer.innerHTML = '';
        breedInfo.innerHTML = '';
        updateBreedList();
    });

    favsBtn.addEventListener('click', () => {
        setMode('favs');
        breedSelector.style.display = 'none';
        breedInfo.innerHTML = '';
        fetchRandomCat();
    });

    breedSearch.addEventListener('input', updateBreedList);

    favoriteButton.addEventListener('click', async () => {
        if (currentCatId) {
            try {
                await fetch(`/favorite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ catId: currentCatId })
                });
                alert('Cat added to favorites!');
            } catch (error) {
                console.error('Error adding to favorites:', error);
            }
        }
    });

    likeButton.addEventListener('click', async () => {
        if (currentCatId) {
            try {
                await fetch(`/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ catId: currentCatId, vote: 'like' })
                });
                alert('You liked this cat!');
            } catch (error) {
                console.error('Error voting:', error);
            }
        }
    });

    dislikeButton.addEventListener('click', async () => {
        if (currentCatId) {
            try {
                await fetch(`/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ catId: currentCatId, vote: 'dislike' })
                });
                alert('You disliked this cat!');
            } catch (error) {
                console.error('Error voting:', error);
            }
        }
    });

    // Initial setup
    fetchBreeds().then(() => {
        setMode('voting');
        fetchRandomCat();
    });
});