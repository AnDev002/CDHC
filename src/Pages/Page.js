import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Shield, 
  TrendingUp, 
  Wallet, 
  Eye, 
  EyeOff, 
  LogOut, 
  Settings,
  BarChart3,
  ArrowUpDown,
  Plus,
  Minus,
  Lock,
  Bell,
  RefreshCw,
  Upload,
  Download,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Users,
  Monitor,
  Activity,
  Database,
} from 'lucide-react';

const CPOTradingPlatform = () => {
  // Main App State
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAccount, setUserAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form States
  const [loginForm, setLoginForm] = useState({ cccd: '', password: '' });
  const [updateForm, setUpdateForm] = useState({});
  const [orderForm, setOrderForm] = useState({ type: 'buy', amount: '', price: '' });
  const [depositAmount, setDepositAmount] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(null);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Data States
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [userViolations, setUserViolations] = useState({});

  // Mock Database - In production, replace with real API calls
  const mockUsers = {
    '123456789012': {
      oldCCCD: '123456789012',
      newCCCD: null,
      password: '123456',
      newPassword: null,
      personalInfo: {
        fullName: 'Nguyễn Văn An',
        phone: '0987654321',
        email: 'nguyenvanan@email.com',
        address: 'Hà Nội, Việt Nam',
        bankAccount: '1234567890',
        bankName: 'Vietcombank'
      },
      balance: { CPO: 1500, OGN: 25000, TOR: 890 },
      isFirstLogin: true,
      violations: 0,
      isActive: true,
      role: 'user'
    },
    'admin': {
      cccd: 'admin',
      password: 'admin123',
      role: 'admin',
      personalInfo: { fullName: 'Admin User' }
    }
  };

  const mockOrderBook = [
    { id: 1, type: 'sell', amount: 200, price: 17.0, status: 'pending', user: 'User123', timestamp: new Date() },
    { id: 2, type: 'sell', amount: 100, price: 16.5, status: 'pending', user: 'User456', timestamp: new Date() },
    { id: 3, type: 'buy', amount: 150, price: 16.0, status: 'pending', user: 'User789', timestamp: new Date() },
    { id: 4, type: 'buy', amount: 300, price: 15.5, status: 'pending', user: 'User321', timestamp: new Date() }
  ];

  // Security & Validation Functions
  const validateCCCD = (cccd) => {
    return cccd && cccd.length >= 9 && /^\d+$/.test(cccd);
  };

  const validatePassword = (password) => {
    return password && password.length >= 8;
  };

  const validateAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000;
  };

  const validatePrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0 && num <= 100;
  };

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>\"']/g, '');
  };

  const checkSufficientBalance = (userBalance, requiredAmount, currency) => {
    return userBalance[currency] >= requiredAmount;
  };

  const generateTransactionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const logSecurityEvent = (event, userId, details) => {
    console.log(`[SECURITY] ${new Date().toISOString()} - ${event} - User: ${userId} - ${details}`);
  };

  // Timer for deposit countdown
  useEffect(() => {
    let interval;
    if (currentView === 'deposit' && depositAmount && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setDepositAmount(null);
            setError('Lệnh nạp đã hết hạn. Vui lòng thử lại.');
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, depositAmount, timeLeft]);

  // Load initial data
  useEffect(() => {
    setOrders(mockOrderBook);
    // In production: fetch real data from API
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Authentication Functions
  const handleLogin = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const cccd = sanitizeInput(loginForm.cccd);
      const password = sanitizeInput(loginForm.password);
      
      if (!cccd || !password) {
        throw new Error('Vui lòng nhập đầy đủ thông tin đăng nhập');
      }

      // Check admin login
      if (cccd === 'admin' && password === 'admin123') {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUserAccount(mockUsers.admin);
        setCurrentView('admin');
        logSecurityEvent('ADMIN_LOGIN', 'admin', 'Admin login successful');
        return;
      }

      // Check user login
      const user = mockUsers[cccd];
      if (!user) {
        logSecurityEvent('LOGIN_FAILED', cccd, 'User not found');
        throw new Error('Thông tin đăng nhập không chính xác');
      }

      if (!user.isActive) {
        logSecurityEvent('LOGIN_BLOCKED', cccd, 'Account blocked');
        throw new Error('Tài khoản đã bị khóa. Liên hệ admin để được hỗ trợ');
      }

      if (user.password !== password && user.newPassword !== password) {
        user.violations = (user.violations || 0) + 1;
        logSecurityEvent('LOGIN_FAILED', cccd, `Wrong password. Violations: ${user.violations}`);
        
        if (user.violations >= 5) {
          user.isActive = false;
          throw new Error('Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần');
        }
        
        throw new Error(`Mật khẩu không chính xác. Còn ${5 - user.violations} lần thử`);
      }

      // Reset violations on successful login
      user.violations = 0;
      
      setIsLoggedIn(true);
      setUserAccount(user);
      
      if (user.isFirstLogin) {
        setCurrentView('update-info');
        logSecurityEvent('FIRST_LOGIN', cccd, 'First login - redirect to update info');
      } else {
        setCurrentView('dashboard');
        logSecurityEvent('LOGIN_SUCCESS', cccd, 'Regular login successful');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loginForm, loading]);

  const handleUpdateInfo = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const newCCCD = sanitizeInput(updateForm.newCCCD || '');
      const newPassword = sanitizeInput(updateForm.newPassword || '');
      
      if (!validateCCCD(newCCCD)) {
        throw new Error('CCCD mới không hợp lệ (tối thiểu 9 số)');
      }
      
      if (!validatePassword(newPassword)) {
        throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
      }

      if (newCCCD === userAccount.oldCCCD) {
        throw new Error('CCCD mới phải khác CCCD cũ');
      }

      // Check if new CCCD already exists
      if (mockUsers[newCCCD]) {
        throw new Error('CCCD mới đã được sử dụng bởi tài khoản khác');
      }

      const updatedAccount = {
        ...userAccount,
        newCCCD: newCCCD,
        newPassword: newPassword,
        personalInfo: { 
          ...userAccount.personalInfo, 
          ...Object.fromEntries(
            Object.entries(updateForm)
              .filter(([key]) => !['newCCCD', 'newPassword'].includes(key))
              .map(([key, value]) => [key, sanitizeInput(value || '')])
          )
        },
        isFirstLogin: false
      };
      
      setUserAccount(updatedAccount);
      setCurrentView('dashboard');
      setSuccess('Cập nhật thông tin thành công!');
      
      logSecurityEvent('PROFILE_UPDATE', newCCCD, 'Profile updated successfully');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [updateForm, userAccount, loading]);

  // Trading Functions
  const handlePlaceOrder = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const amount = parseFloat(orderForm.amount);
      const price = parseFloat(orderForm.price);
      const type = orderForm.type;
      
      if (!validateAmount(amount)) {
        throw new Error('Số lượng không hợp lệ (1-1,000,000)');
      }
      
      if (!validatePrice(price)) {
        throw new Error('Giá không hợp lệ (0.01-100)');
      }

      // Check balance
      if (type === 'sell') {
        if (!checkSufficientBalance(userAccount.balance, amount, 'CPO')) {
          throw new Error(`Không đủ CPO. Bạn có ${userAccount.balance.CPO} CPO`);
        }
      } else {
        const totalCost = amount * price;
        if (!checkSufficientBalance(userAccount.balance, totalCost, 'OGN')) {
          throw new Error(`Không đủ OGN. Cần ${totalCost} OGN, bạn có ${userAccount.balance.OGN} OGN`);
        }
      }

      const newOrder = {
        id: generateTransactionId(),
        type: type,
        amount: amount,
        price: price,
        status: 'pending',
        user: userAccount.newCCCD || userAccount.oldCCCD,
        timestamp: new Date().toISOString(),
        userId: userAccount.newCCCD || userAccount.oldCCCD
      };

      // Try to match orders
      const matchedOrders = matchOrders(newOrder, orders);
      
      if (matchedOrders.length > 0) {
        // Execute matched trades
        executeTradeMatches(matchedOrders, newOrder);
      } else {
        // Add to order book
        setOrders(prev => [...prev, newOrder]);
      }
      
      setOrderForm({ type: 'buy', amount: '', price: '' });
      setSuccess(`Đặt lệnh ${type === 'buy' ? 'mua' : 'bán'} thành công!`);
      
      logSecurityEvent('ORDER_PLACED', userAccount.newCCCD || userAccount.oldCCCD, 
        `${type} ${amount} CPO at ${price} OGN`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderForm, userAccount, orders, loading]);

  const matchOrders = (newOrder, existingOrders) => {
    return existingOrders.filter(order => {
      if (order.status !== 'pending') return false;
      if (order.userId === newOrder.userId) return false; // Can't trade with yourself
      
      if (newOrder.type === 'buy' && order.type === 'sell') {
        return newOrder.price >= order.price;
      } else if (newOrder.type === 'sell' && order.type === 'buy') {
        return newOrder.price <= order.price;
      }
      return false;
    }).sort((a, b) => {
      // Sort by best price and timestamp
      if (newOrder.type === 'buy') {
        return a.price - b.price || new Date(a.timestamp) - new Date(b.timestamp);
      } else {
        return b.price - a.price || new Date(a.timestamp) - new Date(b.timestamp);
      }
    });
  };

  const executeTradeMatches = (matchedOrders, newOrder) => {
    let remainingAmount = newOrder.amount;
    const executedTrades = [];
    
    for (const matchedOrder of matchedOrders) {
      if (remainingAmount <= 0) break;
      
      const tradeAmount = Math.min(remainingAmount, matchedOrder.amount);
      const tradePrice = matchedOrder.price; // Use existing order price
      
      executedTrades.push({
        id: generateTransactionId(),
        buyerUserId: newOrder.type === 'buy' ? newOrder.userId : matchedOrder.userId,
        sellerUserId: newOrder.type === 'sell' ? newOrder.userId : matchedOrder.userId,
        amount: tradeAmount,
        price: tradePrice,
        timestamp: new Date().toISOString()
      });
      
      // Update matched order
      if (matchedOrder.amount === tradeAmount) {
        matchedOrder.status = 'completed';
      } else {
        matchedOrder.amount -= tradeAmount;
      }
      
      remainingAmount -= tradeAmount;
    }
    
    // Update balances for all trades
    executedTrades.forEach(trade => {
      updateBalancesAfterTrade(trade);
    });
    
    // Add remaining amount as new order if any
    if (remainingAmount > 0) {
      const partialOrder = {
        ...newOrder,
        amount: remainingAmount
      };
      setOrders(prev => [...prev, partialOrder]);
    }
    
    // Update order book
    setOrders(prev => prev.map(order => {
      const matchedOrder = matchedOrders.find(mo => mo.id === order.id);
      return matchedOrder ? matchedOrder : order;
    }));
    
    setTransactions(prev => [...prev, ...executedTrades]);
  };

  const updateBalancesAfterTrade = (trade) => {
    // In production, this would be handled by backend
    // Update user balance here for demo purposes
    if ((userAccount.newCCCD || userAccount.oldCCCD) === trade.buyerUserId) {
      setUserAccount(prev => ({
        ...prev,
        balance: {
          ...prev.balance,
          CPO: prev.balance.CPO + trade.amount,
          OGN: prev.balance.OGN - (trade.amount * trade.price)
        }
      }));
    } else if ((userAccount.newCCCD || userAccount.oldCCCD) === trade.sellerUserId) {
      setUserAccount(prev => ({
        ...prev,
        balance: {
          ...prev.balance,
          CPO: prev.balance.CPO - trade.amount,
          OGN: prev.balance.OGN + (trade.amount * trade.price)
        }
      }));
    }
  };

  // Deposit Functions
  const handleInitiateDeposit = useCallback((amount) => {
    if (!validateAmount(amount)) {
      setError('Số lượng nạp không hợp lệ');
      return;
    }
    
    setDepositAmount(amount);
    setTimeLeft(600); // Reset timer
    
    logSecurityEvent('DEPOSIT_INITIATED', userAccount.newCCCD || userAccount.oldCCCD, 
      `Amount: ${amount} OGN`);
  }, [userAccount]);

  const handleConfirmDeposit = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const cccd = userAccount.newCCCD || userAccount.oldCCCD;
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const transferContent = `${cccd} ${depositAmount} ${date}`;
      
      const depositRequest = {
        id: generateTransactionId(),
        userId: cccd,
        amount: depositAmount,
        transferContent: transferContent,
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'deposit'
      };
      
      setPendingDeposits(prev => [...prev, depositRequest]);
      
      setDepositAmount(null);
      setCurrentView('dashboard');
      setSuccess('Yêu cầu nạp tiền đã được gửi. Chờ admin duyệt sau khi chuyển khoản.');
      
      logSecurityEvent('DEPOSIT_CONFIRMED', cccd, `Deposit request: ${depositAmount} OGN`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [depositAmount, userAccount, loading]);

  // Withdrawal Functions
  const handleInitiateWithdraw = useCallback((amount) => {
    if (!validateAmount(amount)) {
      setError('Số lượng rút không hợp lệ');
      return;
    }
    
    if (!checkSufficientBalance(userAccount.balance, amount, 'OGN')) {
      setError(`Không đủ OGN. Bạn có ${userAccount.balance.OGN} OGN`);
      return;
    }
    
    setWithdrawAmount(amount);
    
    logSecurityEvent('WITHDRAW_INITIATED', userAccount.newCCCD || userAccount.oldCCCD, 
      `Amount: ${amount} OGN`);
  }, [userAccount]);

  const handleConfirmWithdraw = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const cccd = userAccount.newCCCD || userAccount.oldCCCD;
      const withdrawFee = 0.1;
      const actualAmount = withdrawAmount * (1 - withdrawFee);
      
      if (!userAccount.personalInfo.bankAccount) {
        throw new Error('Vui lòng cập nhật thông tin tài khoản ngân hàng trước khi rút tiền');
      }
      
      const withdrawRequest = {
        id: generateTransactionId(),
        userId: cccd,
        amount: withdrawAmount,
        actualAmount: actualAmount,
        fee: withdrawAmount * withdrawFee,
        bankAccount: userAccount.personalInfo.bankAccount,
        bankName: userAccount.personalInfo.bankName,
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'withdraw'
      };
      
      setPendingWithdrawals(prev => [...prev, withdrawRequest]);
      
      setWithdrawAmount(null);
      setCurrentView('dashboard');
      setSuccess('Yêu cầu rút tiền đã được gửi. Chờ admin duyệt và chuyển khoản.');
      
      logSecurityEvent('WITHDRAW_CONFIRMED', cccd, `Withdraw request: ${withdrawAmount} OGN`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [withdrawAmount, userAccount, loading]);

  // Admin Functions
  const handleApproveDeposit = useCallback(async (depositId) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const deposit = pendingDeposits.find(d => d.id === depositId);
      if (!deposit) throw new Error('Không tìm thấy lệnh nạp');
      
      // Update deposit status
      setPendingDeposits(prev => 
        prev.map(d => d.id === depositId ? { ...d, status: 'approved' } : d)
      );
      
      // Update user balance (in production, this would be handled by backend)
      if (deposit.userId === (userAccount.newCCCD || userAccount.oldCCCD)) {
        setUserAccount(prev => ({
          ...prev,
          balance: {
            ...prev.balance,
            OGN: prev.balance.OGN + deposit.amount
          }
        }));
      }
      
      setSuccess(`Đã duyệt lệnh nạp ${deposit.amount} OGN`);
      
      logSecurityEvent('DEPOSIT_APPROVED', 'admin', `Approved deposit: ${deposit.amount} OGN for user ${deposit.userId}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pendingDeposits, userAccount, loading]);

  const handleRejectDeposit = useCallback(async (depositId) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const deposit = pendingDeposits.find(d => d.id === depositId);
      if (!deposit) throw new Error('Không tìm thấy lệnh nạp');
      
      // Update deposit status
      setPendingDeposits(prev => 
        prev.map(d => d.id === depositId ? { ...d, status: 'rejected' } : d)
      );
      
      // Increase user violations
      const violations = (userViolations[deposit.userId] || 0) + 1;
      setUserViolations(prev => ({ ...prev, [deposit.userId]: violations }));
      
      if (violations >= 5) {
        // Block user permanently
        logSecurityEvent('USER_BLOCKED', 'admin', `User ${deposit.userId} blocked for violations`);
      }
      
      setSuccess(`Đã từ chối lệnh nạp. User vi phạm ${violations}/5 lần`);
      
      logSecurityEvent('DEPOSIT_REJECTED', 'admin', `Rejected deposit for user ${deposit.userId}. Violations: ${violations}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pendingDeposits, userViolations, loading]);

  const handleApproveWithdraw = useCallback(async (withdrawId) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const withdraw = pendingWithdrawals.find(w => w.id === withdrawId);
      if (!withdraw) throw new Error('Không tìm thấy lệnh rút');
      
      // Update withdraw status
      setPendingWithdrawals(prev => 
        prev.map(w => w.id === withdrawId ? { ...w, status: 'approved' } : w)
      );
      
      // Deduct from user balance (in production, this would be handled by backend)
      if (withdraw.userId === (userAccount.newCCCD || userAccount.oldCCCD)) {
        setUserAccount(prev => ({
          ...prev,
          balance: {
            ...prev.balance,
            OGN: prev.balance.OGN - withdraw.amount
          }
        }));
      }
      
      setSuccess(`Đã duyệt lệnh rút ${withdraw.actualAmount} VNĐ`);
      
      logSecurityEvent('WITHDRAW_APPROVED', 'admin', `Approved withdraw: ${withdraw.amount} OGN for user ${withdraw.userId}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pendingWithdrawals, userAccount, loading]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Đã sao chép!');
    } catch (err) {
      setError('Không thể sao chép. Vui lòng copy thủ công.');
    }
  }, []);

  const handleLogout = useCallback(() => {
    logSecurityEvent('LOGOUT', userAccount?.newCCCD || userAccount?.oldCCCD || 'unknown', 'User logged out');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserAccount(null);
    setCurrentView('login');
    setLoginForm({ cccd: '', password: '' });
    setUpdateForm({});
    setOrderForm({ type: 'buy', amount: '', price: '' });
    setDepositAmount(null);
    setWithdrawAmount(null);
    setError('');
    setSuccess('');
  }, [userAccount]);

  // Component Renders
  const LoginView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">CPO Trading Platform</h1>
          <p className="text-white/70">Đăng nhập để truy cập tài khoản</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Số CCCD / Admin
            </label>
            <input
              type="text"
              value={loginForm.cccd}
              onChange={(e) => setLoginForm({...loginForm, cccd: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập CCCD hoặc 'admin'"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/50 hover:text-white"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !loginForm.cccd || !loginForm.password}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Đang đăng nhập...
              </div>
            ) : 'Đăng nhập'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <Shield className="w-4 h-4 inline mr-2" />
            <strong>Demo:</strong> CCCD: 123456789012, Pass: 123456<br />
            <strong>Admin:</strong> admin / admin123
          </p>
        </div>
      </div>
    </div>
  );

  const UpdateInfoView = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl border border-white/20">
        <div className="text-center mb-8">
          <User className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Cập nhật thông tin bảo mật</h2>
          <p className="text-white/70">Vui lòng cập nhật thông tin mới để bảo mật tài khoản</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Số CCCD mới * <Lock className="w-4 h-4 inline text-yellow-400" />
              </label>
              <input
                type="text"
                value={updateForm.newCCCD || ''}
                onChange={(e) => setUpdateForm({...updateForm, newCCCD: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập CCCD mới"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Họ và tên đầy đủ
              </label>
              <input
                type="text"
                value={updateForm.fullName || userAccount?.personalInfo.fullName || ''}
                onChange={(e) => setUpdateForm({...updateForm, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Họ và tên"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={updateForm.phone || userAccount?.personalInfo.phone || ''}
                onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Số điện thoại"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={updateForm.email || userAccount?.personalInfo.email || ''}
                onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Số tài khoản ngân hàng
              </label>
              <input
                type="text"
                value={updateForm.bankAccount || userAccount?.personalInfo.bankAccount || ''}
                onChange={(e) => setUpdateForm({...updateForm, bankAccount: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Số tài khoản"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Tên ngân hàng
              </label>
              <input
                type="text"
                value={updateForm.bankName || userAccount?.personalInfo.bankName || ''}
                onChange={(e) => setUpdateForm({...updateForm, bankName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tên ngân hàng"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Địa chỉ
            </label>
            <textarea
              value={updateForm.address || userAccount?.personalInfo.address || ''}
              onChange={(e) => setUpdateForm({...updateForm, address: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Địa chỉ đầy đủ"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Mật khẩu mới * <Lock className="w-4 h-4 inline text-yellow-400" />
            </label>
            <input
              type="password"
              value={updateForm.newPassword || ''}
              onChange={(e) => setUpdateForm({...updateForm, newPassword: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tạo mật khẩu mới (tối thiểu 8 ký tự)"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleUpdateInfo}
            disabled={loading || !updateForm.newCCCD || !updateForm.newPassword}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Đang cập nhật...
              </div>
            ) : 'Cập nhật thông tin'}
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CPO Trading Platform</h1>
              <p className="text-sm text-gray-500">Xin chào, {userAccount?.personalInfo.fullName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('profile')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              {(pendingDeposits.filter(d => d.status === 'pending').length + pendingWithdrawals.filter(w => w.status === 'pending').length > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">CPO Balance</h3>
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{userAccount?.balance.CPO.toLocaleString() || 0}</p>
            <p className="text-blue-100 text-sm">Cổ phần CPO</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">OGN Balance</h3>
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{userAccount?.balance.OGN.toLocaleString() || 0}</p>
            <p className="text-green-100 text-sm">Điểm thanh toán</p>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setCurrentView('deposit')}
                className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-1" />
                Nạp
              </button>
              <button
                onClick={() => setCurrentView('withdraw')}
                className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Rút
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">TOR Rewards</h3>
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{userAccount?.balance.TOR.toLocaleString() || 0}</p>
            <p className="text-orange-100 text-sm">Điểm thưởng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Interface */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <ArrowUpDown className="w-5 h-5 mr-2" />
              Giao dịch CPO/OGN
            </h3>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setOrderForm({...orderForm, type: 'buy'})}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    orderForm.type === 'buy' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Mua
                </button>
                <button
                  onClick={() => setOrderForm({...orderForm, type: 'sell'})}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    orderForm.type === 'sell' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Bán
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng CPO
                </label>
                <input
                  type="number"
                  value={orderForm.amount}
                  onChange={(e) => setOrderForm({...orderForm, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số lượng"
                  min="1"
                  max="1000000"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá (OGN/CPO)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({...orderForm, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập giá"
                  min="0.01"
                  max="100"
                  disabled={loading}
                />
              </div>

              {orderForm.amount && orderForm.price && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Tổng {orderForm.type === 'buy' ? 'cần' : 'nhận'}: 
                    <span className="font-medium ml-1">
                      {(parseFloat(orderForm.amount) * parseFloat(orderForm.price)).toLocaleString()} OGN
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !orderForm.amount || !orderForm.price}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  orderForm.type === 'buy' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Đang xử lý...
                  </div>
                ) : `Đặt lệnh ${orderForm.type === 'buy' ? 'MUA' : 'BÁN'}`}
              </button>
            </div>
          </div>

          {/* Order Book */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Sổ lệnh CPO/OGN
              </div>
              <button 
                onClick={() => setOrders([...mockOrderBook])}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.filter(order => order.status === 'pending').map((order) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    order.type === 'buy' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div>
                    <span className={`font-medium ${
                      order.type === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {order.type === 'buy' ? 'MUA' : 'BÁN'}
                    </span>
                    <span className="text-gray-600 ml-2">{order.amount} CPO</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{order.price} OGN</div>
                    <div className="text-xs text-gray-500">{order.user}</div>
                  </div>
                </div>
              ))}
              {orders.filter(order => order.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có lệnh nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch gần đây</h3>
            <div className="space-y-2">
              {transactions.slice(-5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Khớp lệnh</span>
                    <span className="text-gray-600 ml-2">{transaction.amount} CPO @ {transaction.price} OGN</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(transaction.amount * transaction.price).toLocaleString()} OGN</div>
                    <div className="text-xs text-gray-500">{new Date(transaction.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DepositView = () => {
    const amounts = [500, 1000, 2000, 5000, 10000, 100000];
    const cccd = userAccount?.newCCCD || userAccount?.oldCCCD || '';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const transferContent = depositAmount ? `${cccd} ${depositAmount} ${date}` : "";
    const bankAccount = "199236789";

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nạp OGN</h1>
                <p className="text-sm text-gray-500">Nạp OGN vào tài khoản để giao dịch</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              {!depositAmount ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn số lượng OGN</h2>
                    <p className="text-gray-600">Chọn gói nạp phù hợp với nhu cầu của bạn</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleInitiateDeposit(amount)}
                        className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-center group"
                        disabled={loading}
                      >
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-green-600">
                          {amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">OGN</div>
                        <div className="text-xs text-green-600 font-medium">
                          ≈ {(amount * 1000).toLocaleString()} VNĐ
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timer */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Thời gian còn lại:</span>
                      <span className="font-bold text-orange-600 text-lg">
                        {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 text-center">
                      Vui lòng hoàn thành chuyển khoản trong thời gian trên
                    </p>
                  </div>

                  {/* Transfer Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-6 text-center text-lg">
                      Thông tin chuyển khoản
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Số tài khoản:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input 
                            value={bankAccount}
                            readOnly
                            className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg text-gray-900 font-mono text-lg"
                          />
                          <button 
                            onClick={() => copyToClipboard(bankAccount)}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Số tiền:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input 
                            value={`${(depositAmount * 1000).toLocaleString()} VNĐ`}
                            readOnly
                            className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg text-gray-900 font-mono text-lg"
                          />
                          <button 
                            onClick={() => copyToClipboard((depositAmount * 1000).toString())}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Nội dung chuyển khoản:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input 
                            value={transferContent}
                            readOnly
                            className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg text-gray-900 font-mono text-lg"
                          />
                          <button 
                            onClick={() => copyToClipboard(transferContent)}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ⚠️ Vui lòng nhập chính xác nội dung này vào phần ghi chú
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setDepositAmount(null);
                        setTimeLeft(600);
                      }}
                      disabled={loading}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Hủy lệnh
                    </button>
                    <button 
                      onClick={handleConfirmDeposit}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Đã chuyển khoản
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">📋 Hướng dẫn chi tiết:</h4>
                    <ol className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start">
                        <span className="font-bold mr-2">1.</span>
                        <span>Mở app ngân hàng và chọn chuyển khoản</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">2.</span>
                        <span>Copy và dán số tài khoản <strong>{bankAccount}</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">3.</span>
                        <span>Nhập số tiền <strong>{(depositAmount * 1000).toLocaleString()} VNĐ</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">4.</span>
                        <span>Copy và dán nội dung: <strong>{transferContent}</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">5.</span>
                        <span>Xác nhận chuyển khoản và bấm "Đã chuyển khoản"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">6.</span>
                        <span>Chờ admin duyệt (thường 5-15 phút)</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const WithdrawView = () => {
    const amounts = [500, 1000, 2000, 5000, 10000, 100000];
    const withdrawFee = 0.1; // 10%

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rút OGN</h1>
                <p className="text-sm text-gray-500">Rút OGN về tài khoản ngân hàng</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              {!withdrawAmount ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Download className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Rút OGN về ngân hàng</h2>
                    <p className="text-gray-600">Chọn số lượng OGN muốn rút</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Phí rút: 10%</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2 text-center">
                      Số tiền thực nhận sẽ được trừ đi 10% phí giao dịch
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amounts.map((amount) => {
                      const actualReceive = amount * (1 - withdrawFee);
                      const canAfford = userAccount?.balance.OGN >= amount;
                      
                      return (
                        <button
                          key={amount}
                          onClick={() => handleInitiateWithdraw(amount)}
                          disabled={!canAfford || loading}
                          className={`p-6 border-2 rounded-xl transition-colors text-center ${
                            canAfford 
                              ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className={`text-2xl font-bold mb-1 ${
                            canAfford ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">OGN</div>
                          <div className="text-xs text-blue-600 font-medium">
                            Nhận: {(actualReceive * 1000).toLocaleString()} VNĐ
                          </div>
                          <div className="text-xs text-red-500">
                            Phí: {((amount - actualReceive) * 1000).toLocaleString()} VNĐ
                          </div>
                          {!canAfford && (
                            <div className="text-xs text-red-500 mt-1 font-medium">
                              Không đủ số dư
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      💰 Số dư hiện tại: {userAccount?.balance.OGN.toLocaleString()} OGN
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Xác nhận rút tiền</h2>
                  </div>

                  {/* Withdrawal Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-4 text-center">Thông tin rút tiền</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Số OGN rút:</span>
                        <span className="font-medium text-blue-900">{withdrawAmount.toLocaleString()} OGN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Phí giao dịch (10%):</span>
                        <span className="font-medium text-red-600">-{(withdrawAmount * 0.1 * 1000).toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-3">
                        <span className="text-blue-700 font-medium text-lg">Số tiền thực nhận:</span>
                        <span className="font-bold text-blue-900 text-lg">{(withdrawAmount * 0.9 * 1000).toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-800 mb-4">🏦 Tài khoản nhận tiền:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngân hàng:</span>
                        <span className="font-medium">{userAccount?.personalInfo.bankName || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số tài khoản:</span>
                        <span className="font-medium font-mono">{userAccount?.personalInfo.bankAccount || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chủ tài khoản:</span>
                        <span className="font-medium">{userAccount?.personalInfo.fullName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setWithdrawAmount(null)}
                      disabled={loading}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Hủy lệnh
                    </button>
                    <button 
                      onClick={handleConfirmWithdraw}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Xác nhận rút tiền
                        </>
                      )}
                    </button>
                  </div>

                  {/* Warning */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium text-sm">⚠️ Lưu ý quan trọng:</p>
                        <ul className="text-red-700 text-xs mt-2 space-y-1">
                          <li>• Thời gian xử lý: 1-3 ngày làm việc</li>
                          <li>• Kiểm tra kỹ thông tin tài khoản trước khi xác nhận</li>
                          <li>• Không thể hủy sau khi đã xác nhận</li>
                          <li>• OGN sẽ bị trừ ngay sau khi admin duyệt</li>
                          <li>• Liên hệ support nếu có vấn đề</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminView = () => {
    const allPending = [...pendingDeposits, ...pendingWithdrawals].filter(t => t.status === 'pending');
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Quản lý hệ thống CPO Trading</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-800 text-sm font-medium">
                  {allPending.length} lệnh chờ duyệt
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <Upload className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Lệnh nạp chờ</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pendingDeposits.filter(d => d.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <Download className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Lệnh rút chờ</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {pendingWithdrawals.filter(w => w.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Lệnh giao dịch</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Người dùng</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Object.keys(mockUsers).length - 1}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Lệnh chờ duyệt</h3>
            
            {allPending.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Không có lệnh chờ duyệt</h4>
                <p className="text-gray-600">Tất cả giao dịch đã được xử lý</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allPending.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'deposit' ? 
                            <Upload className="w-6 h-6 text-green-600" /> : 
                            <Download className="w-6 h-6 text-blue-600" />
                          }
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {transaction.type === 'deposit' ? 'Nạp OGN' : 'Rút OGN'}
                          </h4>
                          <p className="text-sm text-gray-500">User ID: {transaction.userId}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} OGN
                        </p>
                        {transaction.type === 'withdraw' && (
                          <p className="text-sm text-green-600 font-medium">
                            Chuyển: {(transaction.actualAmount * 1000).toLocaleString()} VNĐ
                          </p>
                        )}
                        {transaction.type === 'deposit' && (
                          <p className="text-sm text-gray-500">
                            {(transaction.amount * 1000).toLocaleString()} VNĐ
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            const details = transaction.type === 'deposit' 
                              ? `Nội dung CK: ${transaction.transferContent}\nSố tiền: ${(transaction.amount * 1000).toLocaleString()} VNĐ`
                              : `Tài khoản: ${transaction.bankAccount}\nNgân hàng: ${transaction.bankName}\nSố tiền chuyển: ${(transaction.actualAmount * 1000).toLocaleString()} VNĐ`;
                            alert(details);
                          }}
                          className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </button>
                        
                        <button 
                          onClick={() => transaction.type === 'deposit' 
                            ? handleApproveDeposit(transaction.id)
                            : handleApproveWithdraw(transaction.id)
                          }
                          disabled={loading}
                          className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Duyệt</span>
                        </button>
                        
                        {transaction.type === 'deposit' && (
                          <button 
                            onClick={() => handleRejectDeposit(transaction.id)}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Từ chối</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {transaction.type === 'deposit' && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Nội dung CK:</span> 
                          <span className="font-mono text-gray-900 ml-2">{transaction.transferContent}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Violations */}
          {Object.keys(userViolations).length > 0 && (
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cảnh báo vi phạm</h3>
              
              {Object.entries(userViolations).map(([userId, violations]) => (
                <div key={userId} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">User: {userId}</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Đã vi phạm <strong>{violations}/5</strong> lần. 
                        {violations >= 5 ? (
                          <span className="text-red-800 font-bold"> TÀI KHOẢN ĐÃ BỊ KHÓA.</span>
                        ) : (
                          <span> Còn <strong>{5 - violations}</strong> lần nữa sẽ bị khóa vĩnh viễn.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Trạng thái hệ thống
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="text-green-600 font-medium">✓ Hoạt động</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API:</span>
                  <span className="text-green-600 font-medium">✓ Hoạt động</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trading Engine:</span>
                  <span className="text-green-600 font-medium">✓ Hoạt động</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security:</span>
                  <span className="text-green-600 font-medium">✓ Bảo mật</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Thống kê giao dịch
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giao dịch thành công:</span>
                  <span className="text-green-600 font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng khối lượng:</span>
                  <span className="text-blue-600 font-medium">
                    {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()} CPO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá trị:</span>
                  <span className="text-purple-600 font-medium">
                    {transactions.reduce((sum, t) => sum + (t.amount * t.price), 0).toLocaleString()} OGN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="text-green-600 font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileView = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h1>
              <p className="text-sm text-gray-500">Quản lý thông tin tài khoản</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{userAccount?.personalInfo.fullName}</h2>
              <p className="text-gray-500">ID: {userAccount?.newCCCD || userAccount?.oldCCCD}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <p className="text-gray-900">{userAccount?.personalInfo.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <p className="text-gray-900">{userAccount?.personalInfo.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{userAccount?.personalInfo.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CCCD</label>
                  <p className="text-gray-900 font-mono">{userAccount?.newCCCD || userAccount?.oldCCCD}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <p className="text-gray-900">{userAccount?.personalInfo.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                  <p className="text-gray-900">{userAccount?.personalInfo.bankName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                  <p className="text-gray-900 font-mono">{userAccount?.personalInfo.bankAccount || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Bảo mật tài khoản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng thái tài khoản:</span>
                    <span className="text-green-600 font-medium">✓ Đã xác thực</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mật khẩu:</span>
                    <span className="text-gray-600">••••••••</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lần đăng nhập cuối:</span>
                    <span className="text-gray-600">{new Date().toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('dashboard')}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Quay lại Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render Function
  const renderCurrentView = () => {
    if (!isLoggedIn) {
      return <LoginView />;
    }

    if (isAdmin) {
      return <AdminView />;
    }

    if (currentView === 'update-info') {
      return <UpdateInfoView />;
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'deposit':
        return <DepositView />;
      case 'withdraw':
        return <WithdrawView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  // Global Error Boundary
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error:', event.error);
      setError('Đã xảy ra lỗi hệ thống. Vui lòng tải lại trang.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'l':
            event.preventDefault();
            if (isLoggedIn) handleLogout();
            break;
          case 'd':
            event.preventDefault();
            if (isLoggedIn && !isAdmin) setCurrentView('dashboard');
            break;
          case 'p':
            event.preventDefault();
            if (isLoggedIn && !isAdmin) setCurrentView('profile');
            break;
          default:
            break;
        }
      }

      // ESC to go back
      if (event.key === 'Escape') {
        if (currentView !== 'dashboard' && currentView !== 'login' && currentView !== 'admin') {
          setCurrentView(isAdmin ? 'admin' : 'dashboard');
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isLoggedIn, isAdmin, currentView, handleLogout]);

  // Auto-logout after inactivity
  useEffect(() => {
    let timeoutId;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      if (isLoggedIn) {
        timeoutId = setTimeout(() => {
          logSecurityEvent('AUTO_LOGOUT', userAccount?.newCCCD || userAccount?.oldCCCD || 'unknown', 'Session timeout');
          handleLogout();
          setError('Phiên đăng nhập đã hết hạn do không hoạt động');
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [isLoggedIn, userAccount, handleLogout]);

  return (
    <div className="App">
      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-900 font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {renderCurrentView()}

      {/* Footer */}
      {isLoggedIn && (
        <div className="bg-gray-800 text-white py-4 px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>© 2025 CPO Trading Platform</span>
              <span className="text-gray-400">|</span>
              <span>Version 1.0.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Keyboard:</span>
              <span>Ctrl+D (Dashboard)</span>
              <span>Ctrl+P (Profile)</span>
              <span>Ctrl+L (Logout)</span>
              <span>ESC (Back)</span>
            </div>
          </div>
        </div>
      )}

      {/* Development Notice */}
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium opacity-75">
        DEMO MODE
      </div>
    </div>
  );
};

export default CPOTradingPlatform;
