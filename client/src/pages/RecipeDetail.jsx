import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, ArrowLeft, Loader2, ChefHat, MapPin, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                if (id.startsWith('local_')) {
                    const res = await recipeService.getLocalRecipe(id);
                    setRecipe(res.data);
                } else {
                    const res = await recipeService.getExternalRecipe(id);
                    setRecipe(res.data);
                }
            } catch (err) {
                // Silent error handling
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Loader2 className="animate-spin" size={60} color="var(--primary)" />
        </div>
    );

    if (!recipe) return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2 className="glow-text">RECIPE_NOT_FOUND</h2>
            <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '20px' }}>GO BACK</button>
        </div>
    );

    const isLocal = id?.startsWith('local_');
    const title = isLocal ? recipe.title : recipe.strMeal;
    const image = isLocal ? recipe.image : recipe.strMealThumb;
    const category = isLocal ? recipe.category : recipe.strCategory;
    const area = isLocal ? 'User Submitted' : recipe.strArea;
    const instructions = isLocal ? recipe.instructions : recipe.strInstructions;

    let ingredients = [];
    if (isLocal) {
        ingredients = recipe.ingredients.map(ing => ({ name: ing, measure: '' }));
    } else {
        for (let i = 1; i <= 20; i++) {
            const name = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (name && name.trim()) {
                ingredients.push({ name, measure });
            }
        }
    }

    return (
        <div className="container" style={{ paddingTop: '70px', paddingBottom: '30px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px', height: '40px', minWidth: 'auto', padding: '0 20px' }}>
                <ArrowLeft size={18} /> BACK
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {/* Image Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'relative' }}
                >
                    <img
                        src={image}
                        alt={title}
                        className="card-img"
                        style={{ width: '100%', height: '400px', borderRadius: '4px' }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                        padding: '60px 30px 20px',
                        borderRadius: '0 0 4px 4px'
                    }}>
                        <h1 className="glow-text" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: '15px' }}>
                            {title}
                        </h1>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '5px 15px',
                                background: 'var(--primary)',
                                borderRadius: '4px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>{category}</span>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '5px 15px',
                                background: 'var(--secondary)',
                                color: 'black',
                                borderRadius: '4px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>{area}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Meta Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}
                >
                    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <Tag size={24} color="var(--secondary)" style={{ marginBottom: '10px' }} />
                        <div className="cyber-font" style={{ fontSize: '0.7rem', opacity: 0.6 }}>CATEGORY</div>
                        <div className="glow-text-secondary" style={{ fontSize: '1rem', fontWeight: 700 }}>{category}</div>
                    </div>
                    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <MapPin size={24} color="var(--primary)" style={{ marginBottom: '10px' }} />
                        <div className="cyber-font" style={{ fontSize: '0.7rem', opacity: 0.6 }}>CUISINE</div>
                        <div className="glow-text" style={{ fontSize: '1rem', fontWeight: 700 }}>{area}</div>
                    </div>
                    {isLocal && recipe.cookingTime && (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <Clock size={24} color="var(--accent)" style={{ marginBottom: '10px' }} />
                            <div className="cyber-font" style={{ fontSize: '0.7rem', opacity: 0.6 }}>TIME</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{recipe.cookingTime}</div>
                        </div>
                    )}
                </motion.div>

                {/* Ingredients */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card"
                    style={{ padding: '30px' }}
                >
                    <h3 className="cyber-font glow-text-secondary" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
                        INGREDIENTS_MANIFEST
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {ingredients.map((ing, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                                padding: '10px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '4px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    background: 'var(--secondary)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 5px var(--secondary-glow)'
                                }} />
                                <span style={{ fontSize: '0.9rem' }}>
                                    {ing.measure && <strong style={{ color: 'var(--primary)' }}>{ing.measure} </strong>}
                                    {ing.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                    style={{ padding: '30px' }}
                >
                    <h3 className="cyber-font glow-text" style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ChefHat color="var(--primary)" /> PROTOCOL_INSTRUCTIONS
                    </h3>
                    <div style={{
                        fontSize: '1.05rem',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line',
                        color: 'var(--text)',
                        opacity: 0.9
                    }}>
                        {instructions}
                    </div>
                </motion.div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default RecipeDetail;
