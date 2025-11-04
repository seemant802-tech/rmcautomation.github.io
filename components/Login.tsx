import React, { useState } from 'react';

interface LoginProps {
    onLoginSuccess: () => void;
    onViewReports: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onViewReports }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password for demonstration purposes
        if (password === 'admin') {
            onLoginSuccess();
        } else {
            setError('Invalid password. Please try again.');
            setPassword('');
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Portal Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-brand-accent focus:border-brand-accent transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors"
                        >
                            Login
                        </button>
                    </div>
                     <div className="text-center">
                      <button
                        type="button"
                        onClick={onViewReports}
                        className="text-sm font-medium text-brand-primary hover:text-brand-dark transition-colors"
                      >
                        Or, view public reports
                      </button>
                    </div>
                    <p className="text-center text-xs text-gray-500 pt-2">
                        Hint: The password is '<strong>admin</strong>' for this demo.
                    </p>
                </form>
            </div>
        </main>
    );
};

export default Login;