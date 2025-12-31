"use client";

import { useState, useEffect } from 'react';
import { Loader2, Key, User, Phone, Mail } from 'lucide-react';

export default function ProfilePage() {
    // Personal Details State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsMessage, setDetailsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch User Details on Mount
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setPhone(data.phone || '');
                    setEmail(data.email || '');
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoadingDetails(false);
            }
        };
        fetchDetails();
    }, []);

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingDetails(true);
        setDetailsMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                body: JSON.stringify({ firstName, lastName, phone }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setDetailsMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setDetailsMessage({ type: 'error', text: 'Failed to update profile' });
            }
        } catch {
            setDetailsMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSavingDetails(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingPassword(true);
        setPasswordMessage(null);

        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            setLoadingPassword(false);
            return;
        }

        try {
            const res = await fetch('/api/profile/password', {
                method: 'PUT',
                body: JSON.stringify({ password }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (res.ok) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
                setPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch {
            setPasswordMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setLoadingPassword(false);
        }
    };

    if (loadingDetails) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-brand-gold" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto font-[family-name:var(--font-geist-sans)] pb-12">
            {/* Header */}
            <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 shadow-lg flex items-center gap-4">
                <div className="p-3 bg-brand-gold/20 rounded-full">
                    <User size={32} className="text-brand-gold" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">My Profile</h1>
                    <p className="text-gray-300 mt-1">Manage your personal information and security.</p>
                </div>
            </div>

            {/* Personal Details Section */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-8 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={20} className="text-gray-400" />
                    Personal Details
                </h2>

                {detailsMessage && (
                    <div className={`mb-6 p-4 rounded-lg text-sm border-l-4 ${detailsMessage.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                        {detailsMessage.text}
                    </div>
                )}

                <form onSubmit={handleUpdateDetails} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">To change your email, please contact support.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="Jane"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-right">
                        <button
                            type="submit"
                            disabled={savingDetails}
                            className="bg-brand-gold text-brand-dark px-6 py-2.5 rounded-lg font-bold shadow hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                        >
                            {savingDetails && <Loader2 className="animate-spin" size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Key size={20} className="text-gray-400" />
                    Change Password
                </h2>

                {passwordMessage && (
                    <div className={`mb-6 p-4 rounded-lg text-sm border-l-4 ${passwordMessage.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                        {passwordMessage.text}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-right">
                        <button
                            type="submit"
                            disabled={loadingPassword}
                            className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-medium shadow hover:bg-[#085035] transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                        >
                            {loadingPassword && <Loader2 className="animate-spin" size={18} />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
