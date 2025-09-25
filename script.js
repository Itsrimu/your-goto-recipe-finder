// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");
const loader = document.getElementById("loader");
const categoryPills = document.querySelectorAll(".category-pill");
const themeToggle = document.getElementById("theme-toggle");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

// ================== Event Listeners ==================
searchBtn.addEventListener("click", () => searchMeals(searchInput.value.trim()));
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals(searchInput.value.trim());
});
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));

// Category pills click
categoryPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const category = pill.textContent.trim();
    searchInput.value = category;
    searchMeals(category);
  });
});

// Theme toggle
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerHTML = `<i class="fas fa-sun"></i> Light Mode`;
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    themeToggle.innerHTML = `<i class="fas fa-sun"></i> Light Mode`;
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.innerHTML = `<i class="fas fa-moon"></i> Dark Mode`;
    localStorage.setItem("theme", "light");
  }
});

// ================== Core Functions ==================

// Search Meals
async function searchMeals(searchTerm) {
  if (!searchTerm) {
    showError("Please enter a search term");
    return;
  }

  // Reset UI
  resultHeading.textContent = "";
  mealsContainer.innerHTML = "";
  errorContainer.classList.add("hidden");
  mealDetails.classList.add("hidden");

  // Show loader
  loader.classList.remove("hidden");

  try {
    const response = await fetch(`${SEARCH_URL}${encodeURIComponent(searchTerm)}`);
    const data = await response.json();

    loader.classList.add("hidden"); // hide loader

    if (!data.meals) {
      showError(`No recipes found for "${searchTerm}". Try another search term!`);
    } else {
      resultHeading.textContent = `Search results for "${searchTerm}":`;
      displayMeals(data.meals);
      searchInput.value = "";
    }
  } catch (error) {
    loader.classList.add("hidden");
    showError("Something went wrong. Please try again later.");
  }
}

// Display meal cards
function displayMeals(meals) {
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
        <div class="meal" data-meal-id="${meal.idMeal}">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="meal-info">
            <h3 class="meal-title">${meal.strMeal}</h3>
            ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
          </div>
        </div>
      `
    )
    .join("");
}

// Handle click on meal card
async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");

  try {
    loader.classList.remove("hidden");
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    const data = await response.json();
    loader.classList.add("hidden");

    if (data.meals && data.meals[0]) {
      displayMealDetails(data.meals[0]);
    }
  } catch (error) {
    loader.classList.add("hidden");
    showError("Could not load recipe details. Please try again later.");
  }
}

// Display meal details
function displayMealDetails(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
      ingredients.push({
        ingredient: meal[`strIngredient${i}`],
        measure: meal[`strMeasure${i}`],
      });
    }
  }

  mealDetailsContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
    <h2 class="meal-details-title">${meal.strMeal}</h2>
    <div class="meal-details-category">
      <span>${meal.strCategory || "Uncategorized"}</span>
    </div>
    <div class="meal-details-instructions">
      <h3>Instructions</h3>
      <p>${meal.strInstructions}</p>
    </div>
    <div class="meal-details-ingredients">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${ingredients
          .map(
            (item) =>
              `<li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>`
          )
          .join("")}
      </ul>
    </div>
    ${
      meal.strYoutube
        ? `
      <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
        <i class="fab fa-youtube"></i> Watch Video
      </a>
    `
        : ""
    }
  `;

  mealDetails.classList.remove("hidden");
  mealDetails.scrollIntoView({ behavior: "smooth" });
}

// Show error message
function showError(message) {
  resultHeading.textContent = "";
  mealsContainer.innerHTML = "";
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
}
