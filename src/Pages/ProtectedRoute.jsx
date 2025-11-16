import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Simple Basic Auth guard for client-side routes
// Credentials are read from Vite env vars:
// - VITE_BASIC_AUTH_USER
// - VITE_BASIC_AUTH_PASS
// It stores a short-lived flag in sessionStorage for the current tab.
export default function ProtectedRoute({ children }) {
	const navigate = useNavigate();
	const location = useLocation();

	const activeUser = import.meta.env.VITE_BASIC_AUTH_USER || 'admin';
	const activePass = import.meta.env.VITE_BASIC_AUTH_PASS || 'admin';

	const expectedToken = useMemo(() => {
		try {
			return btoa(`${activeUser}:${activePass}`);
		} catch {
			return '';
		}
	}, [activeUser, activePass]);

	const storageKey = useMemo(() => `basic-auth:${expectedToken}`, [expectedToken]);
	const [authorized, setAuthorized] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const ok = sessionStorage.getItem(storageKey) === 'true';
		setAuthorized(ok);
	}, [storageKey]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const u = form.get('username')?.toString() ?? '';
		const p = form.get('password')?.toString() ?? '';
		const token = btoa(`${u}:${p}`);
		if (token === expectedToken) {
			sessionStorage.setItem(storageKey, 'true');
			setAuthorized(true);
			setError('');
		} else {
			setError('Invalid credentials.');
			setAuthorized(false);
		}
	};

	const handleCancel = () => {
		navigate('/', { replace: true, state: { from: location } });
	};

		if (!authorized) {
			return (
				<div className="min-h-screen flex items-center justify-center book-bg px-4">
					<div className="w-full max-w-sm rounded-xl bg-gray-800 border border-gray-700 p-6 shadow-xl relative z-10">
					<h1 className="text-xl font-semibold text-white mb-1">Restricted area</h1>
					<p className="text-sm text-gray-300 mb-4">Enter Basic Auth credentials to continue.</p>
					<form onSubmit={handleSubmit} className="space-y-3">
						<div>
							<label htmlFor="username" className="block text-sm text-gray-200 mb-1">Username</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="username"
								required
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm text-gray-200 mb-1">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="password"
								required
							/>
						</div>
						{error ? <p className="text-sm text-red-400">{error}</p> : null}
						<div className="flex items-center gap-2 pt-1">
							<button
								type="submit"
								className="inline-flex justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium text-white"
							>
								Sign in
							</button>
							<button
								type="button"
								onClick={handleCancel}
								className="inline-flex justify-center rounded-md bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-medium text-gray-100"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}

