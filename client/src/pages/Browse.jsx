import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { RecipeCardSkeleton } from '../components/Skeleton';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('s') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('c') || 'All');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await recipeService.getExternalCategories();
                setCategories(['All', 'Drinks', 'Quick Meals', ...res.data.map(c => c.strCategory)]);
            } catch (err) {
                // Silent error handling
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const res = await recipeService.getMerged({
                    s: searchTerm,
                    c: activeCategory === 'All' ? '' : activeCategory
                });
                setRecipes(res.data);
            } catch (err) {
                // Silent error handling
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, [searchTerm, activeCategory]);

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        const params = {};
        if (searchTerm) params.s = searchTerm;
        if (cat !== 'All') params.c = cat;
        setSearchParams(params);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = {};
        if (searchTerm) params.s = searchTerm;
        if (activeCategory !== 'All') params.c = activeCategory;
        setSearchParams(params);
    };

    return (
        <div className="container" style={{ paddingTop: '70px', paddingBottom: '30px' }}>
            <header style={{ marginBottom: '25px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="glow-text" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '10px' }}>
                        Browse <span style={{ color: 'var(--secondary)' }}>Database</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
                        Accessing global recipe archives. System ready.
                    </p>
                </motion.div>

                <div style={{ marginTop: '25px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search
                                style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="SEARCH ARCHIVES..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '50px' }}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', minWidth: 'auto', padding: 0 }}
                                >
                                    <X size={20} color="var(--text-muted)" />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 30px' }}>
                            SCAN
                        </button>
                    </form>
                </div>

                <div style={{ marginTop: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ height: '40px', minWidth: 'auto', padding: '0 20px', fontSize: '0.8rem' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {Array(8).fill(0).map((_, i) => <RecipeCardSkeleton key={i} />)}
                        </div>
                    ) : recipes.length > 0 ? (
                        <motion.div
                            layout
                            className="grid"
                            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                        >
                            {recipes.map((recipe, index) => (
                                <motion.div
                                    key={recipe.idMeal || recipe.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <RecipeCard recipe={recipe} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⊘</div>
                            <h3>NO DATA FOUND IN ARCHIVES</h3>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Browse;
