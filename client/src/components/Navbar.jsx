import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, User, LogOut, Menu, X, Search } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse?s=${searchQuery}`);
            setSearchQuery('');
            closeMenu();
        }
    };

    return (
        <nav className="glass">
            <div className="container nav-container">
                <Link to="/" onClick={closeMenu} className="nav-logo">
                    <div className="logo-icon">
                        <ChefHat size={24} />
                    </div>
                    <span className="mobile-hide">FlavourFlow</span>
                </Link>

                {/* Navbar Search - Desktop */}
                <form onSubmit={handleSearch} className="nav-search-form mobile-hide">
                    <div className="nav-search-wrapper">
                        <Search className="nav-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="nav-search-input"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary nav-search-btn">
                        Search
                    </button>
                </form>

                {/* Mobile Menu Button */}
                <button className="mobile-show nav-toggle" onClick={toggleMenu}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Desktop Menu */}
                <div className="mobile-hide nav-desktop-menu">
                    <Link to="/browse" className="nav-link">Browse</Link>
                    {isAuthenticated && <Link to="/submit" className="nav-link">Submit</Link>}

                    <div className="nav-divider"></div>

                    {isAuthenticated ? (
                        <div className="nav-user-info">
                            <Link to="/profile" className="nav-user-link">
                                <div className="user-avatar">
                                    <User size={20} />
                                </div>
                                <span className="user-name">{user.username}</span>
                            </Link>
                            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary nav-logout-btn">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="btn btn-primary nav-login-btn">Login</Link>
                    )}
                </div>

                {/* Mobile Menu Overlay */}
                {isOpen && (
                    <div className="mobile-menu glass animate-in">
                        <form onSubmit={handleSearch} className="mobile-search-form">
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mobile-search-input"
                            />
                            <button type="submit" className="btn btn-primary mobile-search-btn">
                                Search
                            </button>
                        </form>
                        <Link to="/" onClick={closeMenu} className="mobile-nav-link">Home</Link>
                        <Link to="/browse" onClick={closeMenu} className="mobile-nav-link">Browse Recipes</Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/submit" onClick={closeMenu} className="mobile-nav-link">Submit Recipe</Link>
                                <button onClick={() => { logout(); navigate('/'); closeMenu(); }} className="btn btn-secondary mobile-logout-btn">
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/auth" onClick={closeMenu} className="btn btn-primary mobile-login-btn">Login</Link>
                        )}
                    </div>
                )}
            </div>
            <style jsx="true">{`
                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 100%;
                    gap: 20px;
                }
                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    color: var(--primary);
                    font-weight: 800;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }
                .logo-icon {
                    background: var(--primary);
                    color: white;
                    padding: 6px;
                    border-radius: 10px;
                    display: flex;
                }
                
                .nav-search-form {
                    display: flex;
                    gap: 8px;
                    flex: 1;
                    max-width: 400px;
                }
                .nav-search-wrapper { position: relative; flex: 1; }
                .nav-search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .nav-search-input {
                    padding-left: 38px;
                    height: 44px;
                    font-size: 0.9rem;
                    border-radius: 10px;
                }
                .nav-search-btn {
                    height: 44px;
                    min-width: 100px;
                    padding: 0 16px;
                    font-size: 0.9rem;
                    border-radius: 10px;
                }

                .nav-desktop-menu { display: flex; align-items: center; gap: 24px; }
                .nav-link {
                    text-decoration: none;
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: var(--transition);
                }
                .nav-link:hover { color: var(--primary); }
                .nav-divider { height: 24px; width: 1px; background: #e2e8f0; }

                .nav-user-info { display: flex; align-items: center; gap: 12px; }
                .nav-user-link { display: flex; align-items: center; gap: 8px; color: var(--text); font-weight: 600; }
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #fee2e2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                }
                .user-name { font-size: 0.85rem; }
                .nav-logout-btn { height: 36px; min-width: auto; padding: 0 12px; }
                .nav-login-btn { height: 40px; min-width: 100px; padding: 0 16px; font-size: 0.9rem; }

                .nav-toggle { color: var(--text); background: transparent; }

                .mobile-menu {
                    position: absolute;
                    top: 80px;
                    left: 0;
                    right: 0;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    border-top: 1px solid rgba(255,255,255,0.2);
                    z-index: 1000;
                    max-height: calc(100vh - 80px);
                    overflow-y: auto;
                }

                .mobile-search-form { display: flex; gap: 10px; margin-bottom: 8px; }
                .mobile-search-input { height: 48px; flex: 1; }
                .mobile-search-btn { height: 48px; min-width: 100px; }

                .mobile-nav-link {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text);
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .mobile-logout-btn, .mobile-login-btn { width: 100%; margin-top: 12px; height: 50px; }
            `}</style>
        </nav>
    );
};

export default Navbar;
