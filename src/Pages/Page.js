import React, { useState, useEffect, useCallback } from 'react';
import {
    User, Shield, TrendingUp, Wallet, Eye, EyeOff, LogOut, Settings, BarChart3,
    ArrowUpDown, Plus, Minus, Lock, Bell, RefreshCw, Upload, Download, Copy,
    Clock, CheckCircle, AlertCircle, X, FileText, Users, Monitor, Activity, Database,
} from 'lucide-react';

// ===================================================================================
// NOTE: CSS được nhúng trực tiếp vào component để tránh lỗi không tìm thấy file.
// ===================================================================================
const GlobalStyles = () => (
    <style>{`
        /* --- BIẾN MÀU VÀ THIẾT LẬP CƠ BẢN --- */
        :root {
            --blue-500: #3b82f6; --blue-600: #2563eb;
            --purple-500: #a855f7; --purple-600: #9333ea;
            --green-500: #22c55e; --green-600: #16a34a; --green-900: #14532d;
            --red-500: #ef4444; --red-600: #dc2626;
            --orange-500: #f97316;
            --pink-600: #db2777;
            --yellow-400: #facc15;
            --teal-500: #14b8a6; --teal-600: #0d9488; --teal-900: #134e4a;
            --cyan-500: #06b6d4;
            --gray-900: #111827; --gray-800: #1f2937; --gray-600: #4b5563; --gray-500: #6b7280; --gray-400: #9ca3af; --gray-300: #d1d5db; --gray-200: #e5e7eb; --gray-100: #f3f4f6; --gray-50: #f9fafb;
            --white: #ffffff;
            --text-light: rgba(255, 255, 255, 0.8);
            --border-light: rgba(255, 255, 255, 0.2);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, .app-container { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: var(--gray-50); color: #1f2937; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button { cursor: pointer; font-family: inherit; border: none; background: none; }
        button:disabled { cursor: not-allowed; }
        .grid { display: grid; gap: 1.5rem; }
        
        /* --- ANIMATIONS --- */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* --- GLOBAL COMPONENTS --- */
        .loading-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .spinner { width: 48px; height: 48px; border: 5px solid rgba(255, 255, 255, 0.3); border-top-color: var(--white); border-radius: 50%; animation: spin 0.8s linear infinite; }
        .spinner-icon { animation: spin 0.8s linear infinite; }
        
        .message { padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .message-icon { flex-shrink: 0; }
        .error-message { background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #b91c1c; }
        .success-message { background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #15803d; }
        
        /* --- LOGIN & UPDATE VIEW --- */
        .auth-view { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; animation: fadeIn 0.5s ease-in-out; }
        .auth-box { width: 100%; background-color: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid var(--border-light); border-radius: 1.5rem; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .login-view { background-image: linear-gradient(to bottom right, var(--gray-900), #4c1d95, #1e3a8a); }
        .update-info-view { background-image: linear-gradient(to bottom right, var(--green-900), var(--teal-900), #1e3a8a); }
        .login-box { max-width: 448px; }
        .update-info-box { max-width: 672px; }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-icon-wrapper { width: 4rem; height: 4rem; margin: 0 auto 1rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: 4px solid var(--border-light); color: var(--white); }
        .auth-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--white); margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-light); }
        .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { color: var(--text-light); font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem; }
        .input-group { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-light); opacity: 0.7; }
        .auth-form input, .auth-form textarea { width: 100%; padding: 0.75rem 1rem; background-color: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-light); border-radius: 0.5rem; color: var(--white); transition: all 0.2s; font-size: 1rem; font-family: inherit; }
        .input-group input { padding-left: 3rem; }
        .auth-form input::placeholder, .auth-form textarea::placeholder { color: rgba(255, 255, 255, 0.5); }
        .auth-form input:focus, .auth-form textarea:focus { outline: none; box-shadow: 0 0 0 3px var(--blue-500); }
        .password-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-light); opacity: 0.7; transition: color 0.2s; }
        .password-toggle:hover { opacity: 1; }
        .auth-button { padding: 0.85rem; border-radius: 0.5rem; color: var(--white); font-size: 1.125rem; font-weight: 600; transition: all 0.3s ease; }
        .login-button { background-image: linear-gradient(to right, var(--blue-500), var(--purple-600)); }
        .update-button { background-image: linear-gradient(to right, var(--green-600), var(--teal-600)); }
        .auth-button:not(:disabled):hover { box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); transform: translateY(-2px); }
        .auth-button:disabled { opacity: 0.5; }
        .button-loading-content { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .login-view .message { margin-top: 2rem; }
        .login-view .error-message { background-color: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fecaca; }
        .demo-info { background-color: rgba(250, 204, 21, 0.15); border: 1px solid rgba(250, 204, 21, 0.3); color: #fef08a; line-height: 1.5; }
        .demo-info code { background-color: rgba(250, 204, 21, 0.2); padding: 2px 5px; border-radius: 4px; font-weight: 600; }
        
        /* --- DASHBOARD & GENERAL LAYOUT --- */
        .page-header { background-color: white; border-bottom: 1px solid var(--gray-200); padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 10; }
        .header-content { display: flex; align-items: center; justify-content: space-between; max-width: 1280px; margin: auto; }
        .header-left, .header-right { display: flex; align-items: center; gap: 1rem; }
        .header-logo-icon { width: 2.5rem; height: 2.5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; }
        .header-title { font-size: 1.25rem; font-weight: 700; color: var(--gray-900); }
        .header-subtitle { font-size: 0.875rem; color: var(--gray-500); }
        .header-button { padding: 0.5rem; color: var(--gray-500); border-radius: 9999px; transition: all 0.2s; }
        .header-button:hover { background-color: var(--gray-100); color: var(--gray-900); }
        .logout-button { display:flex; align-items:center; gap: 0.5rem; color: var(--red-600); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; }
        .logout-button:hover { background-color: rgba(239, 68, 68, 0.1); }
        .main-content { padding: 1.5rem; max-width: 1280px; margin: auto; animation: fadeInUp 0.5s ease-in-out; }
        .card { background-color: white; border: 1px solid var(--gray-200); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .card-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; display:flex; align-items:center; gap: 0.5rem; }
        .balance-card { color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.5rem; }
        .balance-card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 1.125rem; opacity: 0.9; }
        .balance-card p { font-size: 2.25rem; font-weight: 700; }
        .balance-card-actions { margin-top: 1rem; display: flex; gap: 0.5rem; }
        .balance-card-actions button { flex: 1; background-color: rgba(255, 255, 255, 0.2); padding: 0.5rem; border-radius: 0.5rem; color: white; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.25rem; transition: background-color 0.2s; }
        .balance-card-actions button:hover { background-color: rgba(255, 255, 255, 0.3); }

        @media (min-width: 1024px) {
            .lg-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .lg-grid-cols-4 { grid-template-columns: repeat(4, 1fr); } /* Changed from 3 to 4 */
        }
    `}</style>
);


const LoginView = ({ loginForm, setLoginForm, handleContinue, handleFinalLogin, loading, error, showPassword, setShowPassword, loginStep }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (loginStep === 'enterIdentifier') {
            handleContinue();
        } else {
            handleFinalLogin();
        }
    };

    return (
        <div className="auth-view login-view">
            <div className="auth-box login-box">
                <div className="auth-header">
                    <div className="auth-icon-wrapper" style={{background: 'linear-gradient(to right, var(--blue-500), var(--purple-600))'}}>
                        <TrendingUp size={32} />
                    </div>
                    <h1>CPO Trading Platform</h1>
                    <p>Đăng nhập để truy cập tài khoản của bạn</p>
                </div>

                {error && (
                    <div className="message error-message" style={{justifyContent: 'center'}}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Số CCCD / Tên Đăng Nhập</label>
                        <div className="input-group">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                value={loginForm.identifier}
                                onChange={(e) => setLoginForm(prev => ({...prev, identifier: e.target.value}))}
                                placeholder="Nhập CCCD hoặc Tên đăng nhập"
                                disabled={loading || loginStep === 'enterPassword'}
                                readOnly={loginStep === 'enterPassword'}
                                style={loginStep === 'enterPassword' ? {backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed'} : {}}
                            />
                        </div>
                    </div>

                    {loginStep === 'enterPassword' && (
                        <div className="form-group" style={{animation: 'fadeInUp 0.4s ease-out'}}>
                            <label>Mật khẩu</label>
                            <div className="input-group">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm(prev => ({...prev, password: e.target.value}))}
                                    placeholder="Nhập mật khẩu của bạn"
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}


                    <button type="submit" className="auth-button login-button" disabled={loading || !loginForm.identifier}>
                        {loading ? (
                            <span className="button-loading-content">
                                <RefreshCw className="spinner-icon" size={20} />
                                Đang xử lý...
                            </span>
                        ) : (loginStep === 'enterPassword' ? 'Đăng nhập' : 'Tiếp tục')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const UpdateInfoView = ({ handleUpdateInfo, loading, error }) => {
    const [updateForm, setUpdateForm] = useState({
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdateInfo(updateForm);
    };

    return (
        <div className="auth-view update-info-view">
            <div className="auth-box login-box">
                <div className="auth-header">
                    <div className="auth-icon-wrapper" style={{background: 'linear-gradient(to right, var(--green-600), var(--teal-600))'}}>
                        <User size={32}/>
                    </div>
                    <h1>Thiết lập tài khoản</h1>
                    <p>Đây là lần đăng nhập đầu tiên, vui lòng tạo tên đăng nhập và mật khẩu mới.</p>
                </div>
                {error && <div className="message error-message" style={{justifyContent: 'center', color: '#fecaca'}}><AlertCircle size={16}/>{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Tên đăng nhập mới *</label>
                        <input type="text" placeholder="Tên để đăng nhập lần sau" value={updateForm.newUsername} onChange={e => setUpdateForm(p => ({...p, newUsername: e.target.value}))}/>
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu mới *</label>
                        <input type="password" placeholder="Tối thiểu 8 ký tự" value={updateForm.newPassword} onChange={e => setUpdateForm(p => ({...p, newPassword: e.target.value}))}/>
                    </div>
                     <div className="form-group">
                        <label>Xác nhận mật khẩu mới *</label>
                        <input type="password" placeholder="Nhập lại mật khẩu mới" value={updateForm.confirmPassword} onChange={e => setUpdateForm(p => ({...p, confirmPassword: e.target.value}))}/>
                    </div>
                    <button type="submit" className="auth-button update-button" disabled={loading || !updateForm.newUsername || !updateForm.newPassword}>
                         {loading ? <span className="button-loading-content"><RefreshCw className="spinner-icon" size={20}/>Đang cập nhật...</span> : 'Hoàn tất'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const DashboardView = ({ userAccount, setCurrentView, handleLogout, success, error }) => (
    <div className="dashboard-view">
        <header className="page-header">
            <div className="header-content">
                <div className="header-left">
                   <div className="header-logo-icon" style={{background: 'linear-gradient(to right, var(--blue-500), var(--purple-600))'}}><TrendingUp /></div>
                    <div>
                        <h1 className="header-title">CPO Trading Platform</h1>
                        <p className="header-subtitle">Xin chào, {userAccount?.name}</p>
                    </div>
                </div>
                <div className="header-right">
                   <button className="header-button" title="Settings" onClick={() => setCurrentView('profile')}><Settings /></button>
                   <button className="header-button" title="Notifications"><Bell /></button>
                   <button onClick={handleLogout} className="logout-button" title="Logout"><LogOut size={18} /><span>Đăng xuất</span></button>
                </div>
            </div>
        </header>
        <main className="main-content">
            {success && <div className="message success-message"><CheckCircle size={16} />{success}</div>}
            {error && <div className="message error-message"><AlertCircle size={16} />{error}</div>}

            {/* --- THAY ĐỔI Ở ĐÂY --- */}
            <div className="grid lg-grid-cols-4"> 
                 <div className="balance-card" style={{background: 'linear-gradient(to right, var(--blue-500), #6366f1)'}}>
                    <div className="balance-card-header"><h3>CPO Đã Mở Khóa</h3><Wallet/></div>
                    <p>{userAccount?.unlock_cpo?.toLocaleString() || 0}</p>
                 </div>
                 {/* Thẻ mới cho Staking CPO */}
                 <div className="balance-card" style={{background: 'linear-gradient(to right, var(--teal-500), var(--cyan-500))'}}>
                    <div className="balance-card-header"><h3>CPO Staking</h3><Database /></div>
                    <p>{userAccount?.staking_cpo?.toLocaleString() || 0}</p>
                 </div>
                 <div className="balance-card" style={{background: 'linear-gradient(to right, var(--green-500), #16a34a)'}}>
                    <div className="balance-card-header"><h3>Điểm Giao Dịch (OGN)</h3><Wallet/></div>
                    <p>{0 /* Placeholder for OGN balance if available */}</p>
                    <div className="balance-card-actions">
                        <button onClick={() => setCurrentView('deposit')}><Upload size={16}/>Nạp</button>
                        <button onClick={() => setCurrentView('withdraw')}><Download size={16}/>Rút</button>
                    </div>
                 </div>
                 <div className="balance-card" style={{background: 'linear-gradient(to right, var(--orange-500), var(--red-500))'}}>
                     <div className="balance-card-header"><h3>TOR Rewards</h3><Wallet/></div>
                    <p>{userAccount?.tor?.toLocaleString() || 0}</p>
                 </div>
            </div>
             <div className="grid lg-grid-cols-2" style={{marginTop: '1.5rem'}}>
                <div className="card">
                   <h2 className="card-title"><ArrowUpDown size={20}/>Giao dịch CPO/OGN</h2>
                   <p>Giao diện giao dịch sẽ được triển khai ở đây.</p>
                </div>
                <div className="card">
                   <h2 className="card-title"><BarChart3 size={20}/>Sổ lệnh</h2>
                   <p>Sổ lệnh sẽ được hiển thị ở đây.</p>
                </div>
             </div>
        </main>
    </div>
);


const CPOTradingPlatform = () => {
    // --- API URL ---
    const API_URL = 'http://localhost:8000/api'; 

    // --- STATE MANAGEMENT ---
    const [currentView, setCurrentView] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAccount, setUserAccount] = useState(null);
    const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
    const [loginStep, setLoginStep] = useState('enterIdentifier');
    const [pendingUserId, setPendingUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // --- AUTHENTICATION LOGIC WITH API CALLS ---
    const handleApiCall = async (endpoint, options) => {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
        return data;
    };
    
    const handleContinue = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await handleApiCall('/auth/check-identifier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: loginForm.identifier }),
            });
            
            setPendingUserId(data.userId); 
            
            if (data.isFirstLogin) {
                setCurrentView('update-info');
            } else {
                setLoginStep('enterPassword');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [loginForm.identifier]);

    const handleFinalLogin = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await handleApiCall('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    identifier: loginForm.identifier, 
                    password: loginForm.password 
                }),
            });
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            
            setUserAccount(data.user);
            setIsLoggedIn(true);
            setCurrentView('dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [loginForm]);
    
    const handleUpdateInfo = useCallback(async (updateForm) => {
        setLoading(true);
        setError('');
        try {
            const data = await handleApiCall('/auth/setup', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: pendingUserId, ...updateForm }),
            });

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.user));

            setUserAccount(data.user);
            setIsLoggedIn(true);
            setSuccess("Cập nhật thành công! Đang chuyển đến trang chính...");
            await new Promise(res => setTimeout(res, 1500));
            setCurrentView('dashboard');
        } catch(err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pendingUserId]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
        setUserAccount(null);
        setCurrentView('login');
        setLoginForm({ identifier: '', password: '' });
        setLoginStep('enterIdentifier');
        setError('');
        setSuccess('');
    }, []);
    
    useEffect(() => {
        if(error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);


    // --- VIEW RENDERING LOGIC ---
    const renderCurrentView = () => {
        if (currentView === 'login') {
            return <LoginView 
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                handleContinue={handleContinue}
                handleFinalLogin={handleFinalLogin}
                loading={loading}
                error={error}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loginStep={loginStep}
            />;
        }

        if(currentView === 'update-info') {
             return <UpdateInfoView
                handleUpdateInfo={handleUpdateInfo}
                loading={loading}
                error={error}
            />
        }

        if(isLoggedIn){
             switch (currentView) {
                case 'dashboard':
                    return <DashboardView 
                        userAccount={userAccount} 
                        setCurrentView={setCurrentView} 
                        handleLogout={handleLogout} 
                        success={success}
                        error={error}
                    />;
                // Add other cases like 'profile', 'admin' etc. here
                default:
                    return <DashboardView 
                        userAccount={userAccount} 
                        setCurrentView={setCurrentView} 
                        handleLogout={handleLogout}
                        success={success}
                        error={error}
                    />;
            }
        }
        
        // Fallback to login
        return <LoginView 
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleContinue={handleContinue}
            handleFinalLogin={handleFinalLogin}
            loading={loading}
            error={error}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loginStep={loginStep}
        />;
    };

    return (
        <div className="app-container">
            <GlobalStyles />
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            {renderCurrentView()}
        </div>
    );
};

export default CPOTradingPlatform;
