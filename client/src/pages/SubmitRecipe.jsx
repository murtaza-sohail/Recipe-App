import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SubmitRecipe = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Breakfast',
        instructions: '',
        ingredients: [''],
        cookingTime: '',
        image: ''
    });

    useEffect(() => {
        if (!isAuthenticated) navigate('/auth');

        const fetchCats = async () => {
            try {
                const res = await recipeService.getExternalCategories();
                setCategories(res.data.map(c => c.strCategory));
            } catch (err) {
                // Silent error handling - categories will default to empty array
            };
        };
        fetchCats();
    }, [isAuthenticated, navigate]);

    const handleIngChange = (idx, val) => {
        const newIngs = [...formData.ingredients];
        newIngs[idx] = val;
        setFormData({ ...formData, ingredients: newIngs });
    };

    const addIng = () => setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
    const removeIng = (idx) => {
        if (formData.ingredients.length > 1) {
            const newIngs = formData.ingredients.filter((_, i) => i !== idx);
            setFormData({ ...formData, ingredients: newIngs });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await recipeService.submitLocal(formData);
            navigate('/browse');
        } catch (err) {
            // Silent error - user will see empty form
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '70px', paddingBottom: '30px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '20px', textAlign: 'center' }}
                >
                    <h1 className="cyber-font glow-text" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '10px' }}>
                        UPLOAD_NEW_RECIPE
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Contribute to the global database
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="card"
                    style={{
                        padding: '20px',
                        display: 'grid',
                        gap: '18px'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="cyber-font" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>RECIPE_TITLE</label>
                        <input
                            required
                            placeholder="e.g. Quantum Pasta Matrix"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="cyber-font" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>CATEGORY</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="cyber-font" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>TIME_DURATION</label>
                            <input
                                placeholder="e.g. 45 mins"
                                value={formData.cookingTime}
                                onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="cyber-font" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>INGREDIENTS_LIST</label>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {formData.ingredients.map((ing, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        required
                                        placeholder={`Component #${idx + 1}`}
                                        value={ing}
                                        onChange={(e) => handleIngChange(idx, e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIng(idx)}
                                        style={{
                                            color: 'var(--primary)',
                                            background: 'rgba(255, 0, 85, 0.1)',
                                            border: '1px solid var(--primary)',
                                            padding: '0 16px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'var(--transition)',
                                            minWidth: 'auto'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addIng}
                            className="btn btn-secondary"
                            style={{ marginTop: '12px', width: '100%' }}
                        >
                            <Plus size={18} /> ADD_COMPONENT
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="cyber-font" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>PROTOCOL_STEPS</label>
                        <textarea
                            required
                            rows="8"
                            placeholder="Describe the execution protocol in detail..."
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="cyber-font" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>IMAGE_URL [OPTIONAL]</label>
                        <input
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="btn btn-primary"
                        style={{ height: '56px', fontSize: '1rem', marginTop: '12px', width: '100%' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> TRANSMIT_DATA</>}
                    </button>
                </motion.form>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SubmitRecipe;
