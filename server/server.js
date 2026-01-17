const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises; // Use promises for async I/O
const fsSync = require('fs'); // Keep sync for initial setup checks
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Initialize Cache (TTL 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

// Data Helpers
const usersFile = path.join(__dirname, 'data', 'users.json');
const recipesFile = path.join(__dirname, 'data', 'recipes.json');

// Ensure data directory and files exist (Sync is fine here for startup)
if (!fsSync.existsSync(path.join(__dirname, 'data'))) {
    fsSync.mkdirSync(path.join(__dirname, 'data'));
}
if (!fsSync.existsSync(usersFile)) {
    fsSync.writeFileSync(usersFile, '[]');
}
if (!fsSync.existsSync(recipesFile)) {
    fsSync.writeFileSync(recipesFile, '[]');
}

// Async Data Read/Write
const readData = async (file) => {
    try {
        const content = await fs.readFile(file, 'utf8');
        return content ? JSON.parse(content) : [];
    } catch (e) {
        if (e.code === 'ENOENT') return [];
        console.error(`Error reading ${file}:`, e);
        return [];
    }
};

const writeData = async (file, data) => {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
};

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    const users = await readData(usersFile);
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'User already exists' });
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { id: uuidv4(), username, password: hashedPassword };
    users.push(newUser);
    await writeData(usersFile, users);
    res.status(201).json({ message: 'User registered' });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readData(usersFile);
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, username: user.username } });
});

// Helper to transform DummyJSON recipes to TheMealDB format
const normalizeDummy = (d) => {
    const meal = {
        idMeal: `dummy_${d.id}`,
        strMeal: d.name,
        strMealThumb: d.image,
        strCategory: d.mealType?.[0] || 'Miscellaneous',
        strArea: d.cuisine || 'International',
        strInstructions: Array.isArray(d.instructions) ? d.instructions.join('\n') : d.instructions,
        isExternal: true,
        source: 'DummyJSON'
    };
    // Map ingredients to strIngredientX logic for consistent frontend display
    (d.ingredients || []).forEach((ing, i) => {
        meal[`strIngredient${i + 1}`] = ing;
        meal[`strMeasure${i + 1}`] = ''; // DummyJSON doesn't provide measures in this array
    });
    return meal;
};

// Helper to transform TheCocktailDB to TheMealDB format
const normalizeCocktail = (c) => {
    // CocktailDB uses strDrink, strDrinkThumb. We map to strMeal, strMealThumb.
    // Ingredients are already strIngredient1...15 matching structure.
    const meal = {
        ...c,
        idMeal: `cocktail_${c.idDrink}`,
        strMeal: c.strDrink,
        strMealThumb: c.strDrinkThumb,
        strCategory: 'Drinks',
        strArea: c.strCategory || 'Beverage',
        strInstructions: c.strInstructions,
        isExternal: true,
        source: 'TheCocktailDB'
    };
    return meal;
};

// TheMealDB Proxy Routes (Cached)
app.get('/api/external/categories', authMiddleware, async (req, res) => {
    const cacheKey = 'categories';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');
        cache.set(cacheKey, response.data.categories);
        res.json(response.data.categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/external/search', authMiddleware, async (req, res) => {
    const { s } = req.query;
    const cacheKey = `search_${s}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${s || ''}`);
        const data = response.data.meals || [];
        cache.set(cacheKey, data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to search recipes' });
    }
});

app.get('/api/external/recipe/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const cacheKey = `recipe_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
        if (id.startsWith('dummy_')) {
            const dummyId = id.replace('dummy_', '');
            const response = await axios.get(`https://dummyjson.com/recipes/${dummyId}`);
            const d = response.data;
            const meal = normalizeDummy(d);
            cache.set(cacheKey, meal);
            res.json(meal);
        } else if (id.startsWith('cocktail_')) {
            const cocktailId = id.replace('cocktail_', '');
            const response = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`);
            const c = response.data.drinks?.[0];
            if (!c) return res.status(404).json({ error: 'Not found' });
            const meal = normalizeCocktail(c);
            cache.set(cacheKey, meal);
            res.json(meal);
        } else {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const meal = response.data.meals ? response.data.meals[0] : null;
            if (meal) cache.set(cacheKey, meal);
            res.json(meal);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/external/filter', authMiddleware, async (req, res) => {
    const { c, a } = req.query;
    const cacheKey = `filter_${c}_${a}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let url = '';
    if (c) url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${c}`;
    else if (a) url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${a}`;

    try {
        const response = await axios.get(url);
        const data = response.data.meals || [];
        cache.set(cacheKey, data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter recipes' });
    }
});

// Merged Recipe Route (Heavy use of parallelism + Caching)
app.get('/api/recipes', authMiddleware, async (req, res) => {
    const { s, c } = req.query;
    const cacheKey = `merged_${s || 'all'}_${c || 'all'}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const localRecipes = await readData(recipesFile);

    let filteredLocal = localRecipes;
    const term = s ? s.toLowerCase() : '';

    if (s) {
        filteredLocal = localRecipes.filter(r =>
            r.title.toLowerCase().includes(term) ||
            (r.ingredients && r.ingredients.some(ing => ing.toLowerCase().includes(term)))
        );
    }
    if (c && c !== 'All') {
        filteredLocal = filteredLocal.filter(r => r.category === c);
    }

    const transformedLocal = filteredLocal.map(r => ({
        idMeal: r.id,
        strMeal: r.title,
        strMealThumb: r.image,
        strCategory: r.category,
        strArea: 'User Submitted',
        isLocal: true
    }));

    try {
        const queries = [];

        // 1. TheMealDB
        if (s) {
            queries.push(
                axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(s)}`)
                    .then(r => r.data.meals || [])
                    .catch(() => [])
            );
        } else if (c && c !== 'All' && c !== 'Drinks') {
            // Map "Quick Meals" to "Starter" or "Breakfast" for data availability
            let queryCategory = c;
            if (c === 'Quick Meals') queryCategory = 'Starter';

            queries.push(
                axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(queryCategory)}`)
                    .then(r => (r.data.meals || []).map(m => ({ ...m, strCategory: c })))
                    .catch(() => [])
            );
        } else if (!c || c === 'All') {
            queries.push(
                axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=`)
                    .then(r => r.data.meals || [])
                    .catch(() => [])
            );
        }

        // 2. DummyJSON
        if (s) {
            queries.push(
                axios.get(`https://dummyjson.com/recipes/search?q=${encodeURIComponent(s)}`)
                    .then(r => (r.data.recipes || []).map(normalizeDummy))
                    .catch(() => [])
            );
        } else if (!c || c === 'All') {
            queries.push(
                axios.get(`https://dummyjson.com/recipes?limit=20`)
                    .then(r => (r.data.recipes || []).map(normalizeDummy))
                    .catch(() => [])
            );
        }

        // 3. TheCocktailDB
        if (s || c === 'Drinks') {
            const queryUrl = s
                ? `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(s)}`
                : `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Ordinary_Drink`;

            queries.push(
                axios.get(queryUrl)
                    .then(r => {
                        const drinks = r.data.drinks || [];
                        return drinks.map(normalizeCocktail);
                    })
                    .catch(() => [])
            );
        }

        const results = await Promise.all(queries);
        let externalMeals = results.flat();

        // deduplicate by idMeal
        const map = new Map();
        externalMeals.forEach(m => {
            if (m && m.idMeal) {
                if (!map.has(m.idMeal) || (m.strCategory && !map.get(m.idMeal).strCategory)) {
                    map.set(m.idMeal, m);
                }
            }
        });

        let finalExternal = Array.from(map.values());

        // apply category filter if it's not a direct category query result
        if (c && c !== 'All' && c !== 'Drinks') {
            finalExternal = finalExternal.filter(m =>
                m.strCategory && m.strCategory.toLowerCase() === c.toLowerCase()
            );
        }

        const finalResult = [...transformedLocal, ...finalExternal];

        // Cache the result (TTL 5 mins for lists looks reasonable)
        cache.set(cacheKey, finalResult, 300);

        res.json(finalResult);
    } catch (err) {
        console.error('Merged route error:', err);
        // Serve at least local on error
        res.json(transformedLocal);
    }
});

// Local Recipe Routes
app.post('/api/recipes', authMiddleware, async (req, res) => {
    const { title, ingredients, instructions, category, cookingTime, image } = req.body;
    if (!title || !ingredients || !instructions) return res.status(400).json({ error: 'Missing fields' });

    try {
        const recipes = await readData(recipesFile);
        const newRecipe = {
            id: `local_${uuidv4()}`,
            title,
            ingredients,
            instructions,
            category,
            cookingTime,
            image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop',
            author: req.user.username,
            createdAt: new Date().toISOString()
        };
        recipes.push(newRecipe);
        await writeData(recipesFile, recipes);

        // Invalidate merged cache potentially? 
        // Simple strategy: Clear keys starting with 'merged_' or just rely on TTL. 
        // For now, let's just clear 'merged_null_null' equivalents if we knew them.
        cache.del(cache.keys().filter(k => k.startsWith('merged_')));

        res.status(201).json(newRecipe);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    if (id.startsWith('local_')) {
        const recipes = await readData(recipesFile);
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
        res.json(recipe);
    } else {
        res.status(400).json({ error: 'Use external route for TheMealDB recipes' });
    }
});

app.delete('/api/recipes/:id', authMiddleware, async (req, res) => {
    try {
        const recipes = await readData(recipesFile);
        const index = recipes.findIndex(r => r.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Not found' });
        if (recipes[index].author !== req.user.username) return res.status(403).json({ error: 'Unauthorized' });
        recipes.splice(index, 1);
        await writeData(recipesFile, recipes);

        cache.del(cache.keys().filter(k => k.startsWith('merged_')));

        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Export for Vercel Serverless
module.exports = app;

// Only listen if not running in Vercel (local development)
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Local: http://localhost:${PORT}`);
        console.log(`Network: http://192.168.100.213:${PORT}`);
    });
}
