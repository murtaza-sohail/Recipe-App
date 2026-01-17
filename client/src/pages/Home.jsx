import { useState, useEffect } from 'react';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { CategorySkeleton, RecipeCardSkeleton } from '../components/Skeleton';
import { Search, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, recRes] = await Promise.all([
                    recipeService.getExternalCategories(),
                    recipeService.getMerged({ s: 'chicken' }) // Featured
                ]);
                setCategories(catRes.data.slice(0, 6));
                setFeatured(recRes.data.slice(0, 6));
            } catch (err) {
                console.error("Failed to fetch home data:", err);
                setError("Failed to load content. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?s=${searchQuery}`);
        }
    };

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        setMousePos({ x, y });
    };

    return (
        <div style={{ overflowX: 'hidden' }} onMouseMove={handleMouseMove}>
            {/* Hero Section */}
            <header style={{
                position: 'relative',
                minHeight: '50vh',
                display: 'flex',
                alignItems: 'center',
                padding: '100px 0 30px',
                background: 'radial-gradient(circle at 70% 30%, rgba(255, 0, 85, 0.1) 0%, transparent 50%)'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div
                        style={{
                            x: mousePos.x,
                            y: mousePos.y,
                            transition: { type: 'spring', damping: 20, stiffness: 100 }
                        }}
                        initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h1 className="glow-text glitch" data-text="NEXT GEN" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 0.9, marginBottom: '20px' }}>
                            NEXT GEN
                        </h1>

                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginTop: '10px', marginBottom: '40px' }}>
                            Discover, share, and save your favorite recipes. FlavourFlow brings together food lovers from around the world.
                        </p>

                        <form onSubmit={handleSearch} style={{ maxWidth: '600px', display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="SEARCH THE GRID..."
                                    style={{ paddingLeft: '50px', height: '60px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 40px' }}>
                                SCAN
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '5%',
                    width: '300px',
                    height: '300px',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    opacity: 0.1
                }} />
            </header>

            <div className="container">
                {error && (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(255, 0, 85, 0.1)',
                        border: '1px solid var(--primary)',
                        color: 'var(--text)',
                        borderRadius: '8px',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>
                        {error}
                        <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ marginLeft: '15px' }}>
                            RETRY
                        </button>
                    </div>
                )}

                {/* Categories Section */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
                        <div>
                            <span className="cyber-font" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>SECTOR_ACCESS</span>
                            <h2 className="glow-text" style={{ fontSize: '2.5rem' }}>DATA MODULES</h2>
                        </div>
                        <Link to="/browse" className="btn btn-secondary" style={{ height: '40px', minWidth: 'auto', padding: '0 20px', fontSize: '0.8rem' }}>
                            VIEW_ALL <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)
                        ) : (
                            categories.map((cat, index) => (
                                <motion.div
                                    key={cat.idCategory}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.05,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    viewport={{ once: true, margin: "-50px" }}
                                >
                                    <Link to={`/browse?c=${cat.strCategory}`} style={{ textDecoration: 'none' }}>
                                        <div className="card" style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
                                            <img src={cat.strCategoryThumb} alt={cat.strCategory} style={{ width: '80px', height: '80px', objectFit: 'contain', opacity: 0.6, marginBottom: '10px' }} />
                                            <h3 className="cyber-font" style={{ fontSize: '0.9rem' }}>{cat.strCategory}</h3>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Featured Recipes */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <span className="cyber-font" style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>HIGH_PRIORITY</span>
                        <h2 className="glow-text" style={{ fontSize: '2.5rem' }}>FEATURED_UPLOADS</h2>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <RecipeCardSkeleton key={i} />)
                        ) : (
                            featured.map((recipe, index) => (
                                <motion.div
                                    key={recipe.idMeal || recipe.id}
                                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    viewport={{ once: true, margin: "-50px" }}
                                >
                                    <RecipeCard recipe={recipe} />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
            </div>
        </div>
    );
};

export default Home;
