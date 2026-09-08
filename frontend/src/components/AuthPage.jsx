import { useState } from 'react';
import { api } from '@/lib/api.js';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

export function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await api.post(endpoint, formData);
      onLoginSuccess(response.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Header Section */}
        <div className="border-b border-border bg-card/50 p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <ShieldCheck className="size-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FinAudit AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enterprise-grade compliance pipeline
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="analyst@firm.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="mt-6 w-full"
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isLogin ? 'Sign in' : 'Create account'}
              {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? 'New to FinAudit AI? ' : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}