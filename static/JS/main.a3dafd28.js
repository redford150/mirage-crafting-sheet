const App = {
  root: null,
  recipes: [],
  filteredRecipes: [],
  categories: [],
  quantity: 1,

  async init() {
    this.root = document.getElementById('root');
    if (!this.root) {
      console.error('No root element found');
      return;
    }

    this.root.innerHTML = '<div class="app-shell"><div class="top-panel"><h1>Mirage Crafting Sheet</h1><div id="app-controls"></div></div><div id="recipe-list"></div></div>';

    try {
      const response = await fetch('recipes.json');
      if (!response.ok) throw new Error(`Failed to load recipes: ${response.status}`);
      this.recipes = await response.json();
    } catch (error) {
      this.root.innerHTML = `<div class="error">Unable to load recipes: ${error.message}</div>`;
      return;
    }

    this.filteredRecipes = [...this.recipes];
    this.categories = ['All', ...new Set(this.recipes.map(recipe => recipe.category || 'Unknown'))];
    this.renderControls();
    this.renderRecipes();
  },

  renderControls() {
    const controls = document.getElementById('app-controls');
    if (!controls) return;

    controls.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'controls';

    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Search recipes...';
    search.addEventListener('input', event => this.onFilterChange(event.target.value, categorySelect.value));

    const categorySelect = document.createElement('select');
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    categorySelect.addEventListener('change', () => this.onFilterChange(search.value, categorySelect.value));

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.value = this.quantity;
    quantityInput.placeholder = 'Quantity';
    quantityInput.addEventListener('input', () => {
      this.quantity = Math.max(1, parseInt(quantityInput.value, 10) || 1);
      quantityInput.value = this.quantity;
      this.renderRecipes();
    });

    container.appendChild(search);
    container.appendChild(categorySelect);
    container.appendChild(quantityInput);
    controls.appendChild(container);
  },

  onFilterChange(searchTerm, category) {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    this.filteredRecipes = this.recipes.filter(recipe => {
      const matchesText = !normalizedSearch || recipe.displayName.toLowerCase().includes(normalizedSearch) || recipe.id.toLowerCase().includes(normalizedSearch);
      const matchesCategory = category === 'All' || (recipe.category || 'Unknown') === category;
      return matchesText && matchesCategory;
    });
    this.renderRecipes();
  },

  renderRecipes() {
    const list = document.getElementById('recipe-list');
    if (!list) return;

    list.innerHTML = '';
    if (this.filteredRecipes.length === 0) {
      list.innerHTML = '<div class="no-results">No recipes match your search.</div>';
      return;
    }

    this.filteredRecipes.sort((a, b) => a.displayName.localeCompare(b.displayName)).forEach(recipe => {
      const card = document.createElement('article');
      card.className = 'recipe-card';

      const header = document.createElement('h2');
      header.textContent = recipe.displayName || recipe.id;
      card.appendChild(header);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `
        <span><strong>ID:</strong> ${recipe.id}</span>
        <span><strong>Level:</strong> ${recipe.level || 'N/A'}</span>
        <span><strong>Category:</strong> ${recipe.category || 'Unknown'}</span>
        ${recipe.blueprint ? `<span><strong>Blueprint:</strong> ${recipe.blueprint}</span>` : ''}
      `;
      card.appendChild(meta);

      const table = document.createElement('table');
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = '<th>Material</th><th>Amount</th>';
      table.appendChild(headerRow);

      const renderItems = items => {
        if (!items || Object.keys(items).length === 0) return;
        Object.entries(items).forEach(([name, value]) => {
          const scaledValue = typeof value === 'number' ? value * this.quantity : value;
          const row = document.createElement('tr');
          row.innerHTML = `<td>${name}</td><td>${scaledValue}</td>`;
          table.appendChild(row);
        });
      };

      if (recipe.materials && Object.keys(recipe.materials).length > 0) {
        const materialsHeader = document.createElement('tr');
        materialsHeader.innerHTML = '<th colspan="2">Materials</th>';
        table.appendChild(materialsHeader);
        renderItems(recipe.materials);
      }

      if (recipe.additionalItems && Object.keys(recipe.additionalItems).length > 0) {
        const additionalHeader = document.createElement('tr');
        additionalHeader.innerHTML = '<th colspan="2">Additional Items</th>';
        table.appendChild(additionalHeader);
        renderItems(recipe.additionalItems);
      }

      if (table.children.length > 1) card.appendChild(table);
      list.appendChild(card);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
