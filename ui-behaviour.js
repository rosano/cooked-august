// PROPERTIES

const _self = {
	filteringSelectedIngredients: [],
	allRecipes: [],
	allIngredients: []
};

// INIT

window.RSXCookedAugustInitWithIngredientsGroupedAndRecipes = function(ingredientsGrouped, recipes) {

	// INGREDIENT BROWSER

	const foodGroup = d3.select('#RSXCookedAugustIngredientBrowserContent')
		.selectAll('.RSXCookedAugustIngredientBrowserGroup')
			.data(Object.keys(ingredientsGrouped));
	
	const ingredientFilter = foodGroup.enter().append('div')
		.attr('class', 'RSXCookedAugustIngredientBrowserGroup')
		.selectAll('.RSXCookedAugustIngredientBrowserFilter')
			.data(d => ingredientsGrouped[d]);

	ingredientFilter.enter().append('div')
		.attr('class', 'RSXCookedAugustIngredientBrowserFilter')
		.text(d => d)
		.on('click', filteringToggleIngredient);
	
	// RECIPE BROWSER

	d3.selectAll('.RSXCookedAugustRecipe img')
		.on('mouseenter', function() {
			return d3.select(this.parentNode)
				.classed('RSXCookedAugustRecipeHovered', true);
		})
		.on('mouseleave', function() {
			return d3.select(this.parentNode)
				.classed('RSXCookedAugustRecipeHovered', false);
		});

	d3.selectAll('.RSXCookedAugustIngredient')
		.on('click', function() {
			_self.filteringSelectedIngredients = [];
			return filteringToggleIngredient(baseIngredientFor(d3.select(this).text()));
		});

	// DATA STRUCTURES

	for (let recipe of Array.from(recipes)) {
		_self.allRecipes.push(recipe);
		const recipeBaseIngredients = [];
		for (let ingredient of Array.from(recipe.ingredients)) {
			const base = baseIngredientFor(ingredient);
			if (!Array.from(_self.allIngredients).includes(base)) {
				_self.allIngredients.push(base);
			}
			recipeBaseIngredients.push(base);
		}

		recipe.ingredients = recipeBaseIngredients;
	}

	// ENABLE JAVASCRIPT ELEMENTS

	d3.select('#RSXCookedAugustIngredientBrowser')
		.classed('RSXCookedAugustHidden', false);

	return d3.select('#RSXCookedAugustRecipeBrowser')
		.classed('RSXCookedAugustRecipeBrowserLinked', true);
};

var baseIngredientFor = ingredient => ingredient.split(/[\[\(]/).shift().trim();

// FILTERING

window.RSXCookedAugustClearFilter = function() {
	_self.filteringSelectedIngredients = [];
	return updateVisiblesForIngredients([]);
};

var filteringToggleIngredient = function(ingredient) {
	const index = _self.filteringSelectedIngredients.indexOf(ingredient);
	if (index !== -1) {
		_self.filteringSelectedIngredients.splice(index, 1);
	} else {
		_self.filteringSelectedIngredients.push(ingredient);
	}

	return updateVisiblesForIngredients(_self.filteringSelectedIngredients);
};

// UPDATES

var updateVisiblesForIngredients = function(selectedIngredients) {
	let visibleIngredients = selectedIngredients;
	const visibleRecipes = [];

	// FIND INGREDIENTS THAT ARE USED WITH SELECTED

	for (let recipe of Array.from(_self.allRecipes)) {
		if (selectiedIngredientsAllInRecipeIngredients(selectedIngredients, recipe.ingredients)) {
			visibleIngredients = visibleIngredients.concat(recipe.ingredients);
			visibleRecipes.push(recipe);
		}
	}

	visibleIngredients = visibleIngredients.filter((value, index) => visibleIngredients.indexOf(value) === index);

	// SIDEBAR

	d3.selectAll('.RSXCookedAugustIngredientBrowserFilter')
		.classed('RSXCookedAugustIngredientBrowserFilterSelected', d => selectedIngredients.indexOf(d) !== -1)
		.classed('RSXCookedAugustHidden', d => visibleIngredients.indexOf(d) === -1);

	d3.selectAll('.RSXCookedAugustThumbnail')
		.classed('RSXCookedAugustHidden', function() {
			return !selectiedIngredientsAllInRecipeIngredients(selectedIngredients, d3.select(this).attr('data-RSXCookedAugustBaseIngredients').split(';'));
		});

	// MAIN CONTENT

	d3.select('#RSXCookedAugustFilterDescription')
		.text(selectedIngredients.length === 0 ? '' : ' with some ' + englishIngredientsTextForBaseIngredients(selectedIngredients));

	d3.select('#RSXCookedAugustFilterClearButton')
		.classed('RSXCookedAugustHidden', () => selectedIngredients.length === 0);

	return d3.selectAll('.RSXCookedAugustRecipe')
		.classed('RSXCookedAugustHidden', function() {
			return !selectiedIngredientsAllInRecipeIngredients(selectedIngredients, d3.select(this).attr('data-RSXCookedAugustBaseIngredients').split(';'));
		});
};

var selectiedIngredientsAllInRecipeIngredients = function(selectedIngredients, recipeIngredients) {
	for (let e of Array.from(selectedIngredients)) {
		if (!Array.from(recipeIngredients).includes(e)) { return false; }
	}
	return true;
};

var englishIngredientsTextForBaseIngredients = function(baseIngredients) {
	const size = baseIngredients.length;
	if (size === 1) { return baseIngredients[0]; }
	if (size === 2) { return baseIngredients.join(' and '); }
	return baseIngredients.slice(0, size - 1).join(', ') + ` and ${ baseIngredients[size - 1]}`;
};
