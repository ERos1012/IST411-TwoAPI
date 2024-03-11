const photoContainer = document.getElementById('photoContainer');
const recipeContainer = document.getElementById('recipeContainer');
const initialRecipeID = '718932';
const Spoonacular_API_KEY = '277f8a8fff9d4ed1a9dc354dea21526c';
const Youtube_API_KEY = 'AIzaSyAGhro5eOUWpNMqqVKuWce_6eiLGK472Oo';
const Pixabay_API_KEY = '22850428-9964a4ca16315545d67c15abc';



document.addEventListener("DOMContentLoaded", function() {
    const selectElement = document.getElementById('recipeSelect');
    fetchRecipeInformation(initialRecipeID);
    const recipes = [
        { id: '718932', title: 'Recipe 1' }, // Replace with actual recipe IDs and titles
        { id: '716432', title: 'Recipe 2' },
        // Add more recipes as needed
    ];

    // Populate the dropdown menu with options
    recipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.title;
        selectElement.appendChild(option);
    });

    // Add event listener for the change event on the dropdown menu
    selectElement.addEventListener('change', function(event) {
        const selectedRecipeId = event.target.value;
        fetchRecipeInformation(selectedRecipeId);
    });
});

function fetchPhotos(ingredients) {
    const recipeIngredients = document.getElementById('recipeIngredients');
    recipeIngredients.innerHTML = ''; // Clear existing content

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
                    
                    // Create a container for the ingredient and its photo
                    const ingredientContainer = document.createElement('div');
                    ingredientContainer.classList.add('ingredient-container');

                    // Create a div for the ingredient name
                    const ingredientName = document.createElement('div');
                    ingredientName.textContent = ingredient;
                    ingredientName.classList.add('ingredient-name');
                    ingredientContainer.appendChild(ingredientName);

                    // Create an img element for the photo
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.classList.add('ingredient-photo'); // Add a class for styling
                    ingredientContainer.appendChild(img);

                    // Append the ingredient container to the recipeIngredients container
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
            const nutritionTableElement = document.getElementById('nutritionTable'); // Element for nutrition table
            const nutritionInfoElement = document.getElementById('nutritionInfo'); // Element for nutrition info heading

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
                nutritionTableElement.innerHTML = '';

                // Create table header row
                const headerRow = document.createElement('tr');
                const headerCell = document.createElement('th');
                headerCell.textContent = 'Nutrient Information';
                headerRow.appendChild(headerCell);
                nutritionTableElement.appendChild(headerRow);

                // Create table body rows
                nutrients.forEach(nutrient => {
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td');
                    nameCell.textContent = nutrient.name;
                    const amountCell = document.createElement('td');
                    amountCell.textContent = `${nutrient.amount}${nutrient.unit}`;
                    row.appendChild(nameCell);
                    row.appendChild(amountCell);
                    nutritionTableElement.appendChild(row);
                });

                // Show the nutrition table
                nutritionInfoElement.style.display = 'block';
            } else {
                nutritionInfoElement.textContent = 'No nutrition information available.';
            }

            fetchYoutubeVideo(recipeInfo.title);
        } else {
            console.error('Request failed with status:', htmlRequest.status);
        }
    };
    htmlRequest.send();
}





function fetchYoutubeVideo(recipeTitle) {
    const encodedQuery = encodeURIComponent(recipeTitle); // URL encode the recipe title
    const youtubeRequest = new XMLHttpRequest();
    youtubeRequest.open("GET", `https://www.googleapis.com/youtube/v3/search?key=${Youtube_API_KEY}&q=${encodedQuery}&part=snippet&type=video`, true);
    youtubeRequest.onload = function() {
        if (youtubeRequest.status === 200) {
            const response = JSON.parse(youtubeRequest.responseText);
            const videoId = response.items[0].id.videoId;
            const videoUrl = `https://www.youtube.com/embed/${videoId}`; // Embed URL
            const videoFrame = document.getElementById('videoFrame');
            videoFrame.src = videoUrl; // Set iframe src
        } else {
            console.error('Request failed with status:', youtubeRequest.status);
        }
    };
    youtubeRequest.send();
}

