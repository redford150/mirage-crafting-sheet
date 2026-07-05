const App = {
  root: null,
  recipes: [],
  filteredRecipes: [],
  categories: [],

  async init() {
    this.root = document.getElementById('root');
    if (!this.root) {
      console.error('No root element found');
      return;
    }

    this.insertStyles();
    this.root.innerHTML = '<div class="app-shell"><h1>Mirage Crafting Sheet</h1><div id="app-controls"></div><div id="recipe-list"></div></div>';

    try {
      const response = await fetch('/recipes.json');
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

  insertStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .app-shell { padding: 20px; font-family: Inter, system-ui, sans-serif; color: #111; }
      .app-shell h1 { margin-bottom: 16px; font-size: 2rem; }
      .controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
      .controls input, .controls select { padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; min-width: 220px; }
      .recipe-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
      .recipe-card { border: 1px solid #ddd; border-radius: 16px; padding: 16px; background: #fff; box-shadow: 0 8px 20px rgba(15,23,42,.05); }
      .recipe-card h2 { margin: 0 0 8px; font-size: 1.2rem; }
      .recipe-card .meta { color: #555; margin-bottom: 12px; font-size: .95rem; }
      .recipe-card .meta span { display: inline-block; margin-right: 12px; }
      .recipe-card table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      .recipe-card th, .recipe-card td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
      .recipe-card th { width: 35%; color: #333; }
      .no-results, .error { padding: 16px; background: #fff4f4; border: 1px solid #f5c2c7; color: #842029; border-radius: 12px; }
    `;
    document.head.appendChild(style);
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

    container.appendChild(search);
    container.appendChild(categorySelect);
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
          const row = document.createElement('tr');
          row.innerHTML = `<td>${name}</td><td>${value}</td>`;
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
