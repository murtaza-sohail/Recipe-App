import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ username: '', password: '' });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                const res = await authService.login(formData);
                login(res.data.user, res.data.token);
                navigate('/');
            } else {
                await authService.register(formData);
                setIsLogin(true);
                alert('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="card hud-panel energy-pulse"
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    padding: '25px',
                    position: 'relative',
                    overflow: 'visible'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    borderTop: '2px solid var(--primary)',
                    borderLeft: '2px solid var(--primary)',
                    boxShadow: '0 0 10px var(--primary-glow)'
                }} />

                {/* HUD Corners */}
                <div className="hud-corner top-left" />
                <div className="hud-corner top-right" />
                <div className="hud-corner bottom-left" />
                <div className="hud-corner bottom-right" />

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 className="cyber-font glow-text" style={{ fontSize: '2rem', marginBottom: '10px' }}>
                        {isLogin ? 'ACCESS_PANEL' : 'NEW_OPERATIVE'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Enter your credentials to proceed' : 'Register for system access'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 0, 85, 0.1)',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <User
                            style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--secondary)'
                            }}
                            size={20}
                        />
                        <input
                            required
                            placeholder="USERNAME"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            style={{ paddingLeft: '50px', height: '56px' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock
                            style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--secondary)'
                            }}
                            size={20}
                        />
                        <input
                            required
                            type="password"
                            placeholder="PASSWORD"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ paddingLeft: '50px', height: '56px' }}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="btn btn-primary"
                        style={{ height: '56px', fontSize: '1rem', marginTop: '8px', width: '100%' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'LOGIN' : 'REGISTER'} <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {isLogin ? "Need access?" : "Already registered?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--secondary)',
                            fontWeight: 700,
                            marginLeft: '8px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            textDecoration: 'underline',
                            padding: 0,
                            minWidth: 'auto'
                        }}
                    >
                        {isLogin ? 'Register here' : 'Login here'}
                    </button>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    borderBottom: '2px solid var(--secondary)',
                    borderRight: '2px solid var(--secondary)',
                    boxShadow: '0 0 10px var(--secondary-glow)'
                }} />
            </motion.div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Auth;
