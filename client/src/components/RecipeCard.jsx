import { recipeService } from '../services/api';
import { Link } from 'react-router-dom';
import HolographicCard from './HolographicCard';
import { MapPin, Tag } from 'lucide-react';

const RecipeCard = ({ recipe }) => {
    if (!recipe) return null;

    const id = recipe.idMeal || recipe.id;
    const title = recipe.strMeal || recipe.title;
    const thumb = recipe.strMealThumb || recipe.image;
    const category = recipe.strCategory || recipe.category;
    const area = recipe.strArea || 'International';

    const detailLink = `/recipe/${id}`;

    const handlePrefetch = () => {
        // Trigger prefetch to prime cache/network
        if (recipe.idMeal) {
            recipeService.getExternalRecipe(id);
        } else {
            recipeService.getLocalRecipe(id);
        }
    };

    return (
        <Link to={detailLink} style={{ textDecoration: 'none' }} onMouseEnter={handlePrefetch}>
            <HolographicCard className="card">
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img src={thumb} alt={title} className="card-img" />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        padding: '20px 15px 10px'
                    }}>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {category}
                        </span>
                    </div>
                </div>
                <div className="card-body">
                    <h3 className="glow-text" style={{ fontSize: '1.2rem', marginBottom: '15px', height: '3em', overflow: 'hidden' }}>
                        {title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={12} color="var(--primary)" />
                            <span>{area}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Tag size={12} color="var(--secondary)" />
                            <span>{category}</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Cyberpunk corner */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRight: '2px solid var(--primary)',
                    borderBottom: '2px solid var(--primary)'
                }} />
            </HolographicCard>
        </Link>
    );
};

export default RecipeCard;
