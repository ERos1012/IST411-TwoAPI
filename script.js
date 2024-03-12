const photoContainer = document.getElementById('photoContainer');
const recipeContainer = document.getElementById('recipeContainer');
const Spoonacular_API_KEY = '7c4a6cebd64348b5afe9ee948e12de1d';
const Youtube_API_KEY = 'AIzaSyBZPdorIlHhgq8ZSL-aQ6fiqe95WTZJPAc';
const Pixabay_API_KEY = '22850428-9964a4ca16315545d67c15abc';

document.addEventListener("DOMContentLoaded", function() {
    fetchInitialRecipes();

    // toggle video resource
    const videoButton = document.getElementById('videoCheckbox');
    videoButton.addEventListener('change', toggleVideoResource);

    // select recipe
    const selectElement = document.getElementById('recipeSelect');
    selectElement.addEventListener('change', function(event) {
        const selectedRecipeId = event.target.value;
        fetchRecipeInformation(selectedRecipeId);
    });
});

function fetchInitialRecipes() {
    const htmlRequest = new XMLHttpRequest();
    htmlRequest.open("GET", `https://api.spoonacular.com/recipes/random?number=3&apiKey=${Spoonacular_API_KEY}`, true);
    htmlRequest.onload = function() {
        if (htmlRequest.status === 200) {
            const recipeInfo = JSON.parse(htmlRequest.responseText);
            const recipes = recipeInfo.recipes.map(recipe => ({ id: recipe.id, title: recipe.title }));
            populateSelectElement(recipes);
            fetchRecipeInformation(recipeInfo.recipes[0].id)
        } else {
            console.error('Request failed with status:', htmlRequest.status);
        }
    };
    htmlRequest.send();
}

function populateSelectElement(recipes) {
    const selectElement = document.getElementById('recipeSelect');
    recipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.title;
        selectElement.appendChild(option);
    });
}


function fetchPhotos(ingredients) {
    const recipeIngredients = document.getElementById('recipeIngredients');
    recipeIngredients.innerHTML = '';

    ingredients.forEach(ingredient => {
        const encodedQuery = encodeURIComponent(ingredient);
        const htmlRequest = new XMLHttpRequest();
        htmlRequest.open("GET", `https://pixabay.com/api/?key=${Pixabay_API_KEY}&q=${encodedQuery}&image_type=photo&orientation=horizontal`, true);        htmlRequest.onload = function() {
            if (htmlRequest.status === 200) {
                const response = JSON.parse(htmlRequest.responseText);
                const photos = response.hits;
                if (photos.length > 0) {
                    const photo = photos[0]; 
                    const imageUrl = photo.webformatURL;
                    
                    // Logic for fetching and displaying photos
                    // Ingredients Name
                    const ingredientContainer = document.createElement('div');
                    ingredientContainer.classList.add('ingredient-container');

                    const ingredientName = document.createElement('div');
                    ingredientName.textContent = ingredient;
                    ingredientName.classList.add('ingredient-name');
                    ingredientContainer.appendChild(ingredientName);

                    // Ingredients Photo
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.classList.add('ingredient-photo'); 
                    ingredientContainer.appendChild(img);

                    // Overall Ingredients 
                    recipeIngredients.appendChild(ingredientContainer);
                } else {
                    console.error(`There is no photo for ${ingredient}`);
                }
            } else {
                console.error('Error:', htmlRequest.status);
            }
        };
        htmlRequest.send();
    });
}

function fetchRecipeInformation(recipeId) {
    const htmlRequest = new XMLHttpRequest();
    htmlRequest.open("GET", `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${Spoonacular_API_KEY}`, true);
    htmlRequest.onload = function() {
        if (htmlRequest.status === 200) {
            const recipeInfo = JSON.parse(htmlRequest.responseText);
            console.log(recipeInfo);
            const recipeTitleElement = document.getElementById('recipeTitle');
            const recipeImageElement = document.getElementById('recipeImage');
            const recipeSummaryElement = document.getElementById('recipeSummary');
            const recipeIngredientsElement = document.getElementById('recipeIngredients');
            const recipeStepsElement = document.getElementById('recipeSteps');
            const nutritionTable = document.getElementById('nutritionTable'); // Element for nutrition table body

            recipeTitleElement.textContent = recipeInfo.title;
            recipeImageElement.src = recipeInfo.image;
            recipeSummaryElement.innerHTML = recipeInfo.summary;

            // If ingredients are available, display them
            if (recipeInfo.extendedIngredients && recipeInfo.extendedIngredients.length > 0) {
                const ingredients = recipeInfo.extendedIngredients.map(ingredient => ingredient.name);
                console.log("Ingredients: " + ingredients);
                // Call fetchPhotos with ingredients as query
                fetchPhotos(ingredients);
            } else {
                recipeIngredientsElement.textContent = 'No ingredients available.';
            }

            // If steps are available, display them
            if (recipeInfo.analyzedInstructions && recipeInfo.analyzedInstructions.length > 0) {
                const steps = recipeInfo.analyzedInstructions[0].steps;
                const instructions = steps.map(step => `${step.number}. ${step.step}`).join('<br>');
                recipeStepsElement.innerHTML = instructions;
            } else {
                recipeStepsElement.textContent = 'No instructions available.';
            }

            // Display nutrition information in a table
            if (recipeInfo.nutrition && recipeInfo.nutrition.nutrients) {
                const nutrients = recipeInfo.nutrition.nutrients;
                // Clear previous content
                nutritionTable.innerHTML = '';
                // Populate nutrition table
                nutrients.forEach(nutrient => {
                    const row = nutritionTable.insertRow();
                    const nameCell = row.insertCell(0);
                    const amountCell = row.insertCell(1);
                    nameCell.textContent = nutrient.name;
                    amountCell.textContent = `${nutrient.amount}${nutrient.unit}`;
                });
            } else {
                nutritionTable.innerHTML = '<tr><td colspan="2">No nutrition information available.</td></tr>';
            }

            fetchYoutubeVideo(recipeInfo.title);
        } else {
            console.error('Request failed with status:', htmlRequest.status);
        }
    };
    htmlRequest.send();
}

function fetchYoutubeVideo(recipeTitle) {
    const encodedQuery = encodeURIComponent(recipeTitle); 
    const youtubeRequest = new XMLHttpRequest();
    youtubeRequest.open("GET", `https://www.googleapis.com/youtube/v3/search?key=${Youtube_API_KEY}&q=${encodedQuery}&part=snippet&type=video`, true);
    youtubeRequest.onload = function() {
        if (youtubeRequest.status === 200) {
            const response = JSON.parse(youtubeRequest.responseText);
            const videoId = response.items[0].id.videoId;
            const videoUrl = `https://www.youtube.com/embed/${videoId}`;
            const videoFrame = document.getElementById('videoFrame');
            videoFrame.src = videoUrl; 
        } else {
            console.error('Request failed with status:', youtubeRequest.status);
        }
    };
    youtubeRequest.send();
}

function toggleVideoResource() {
    const videoFrame = document.getElementById('videoFrame');
    const videoButton = document.getElementById('videoCheckbox');

    if (videoFrame.style.display === 'none') {
        videoFrame.style.display = 'block';
        videoButton.classList.add('active');
    } else {
        videoFrame.style.display = 'none';
        videoButton.classList.remove('active');
    }
}