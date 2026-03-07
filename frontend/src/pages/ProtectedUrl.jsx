import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { verifyPassword } from "../services/url.service";

const ProtectedUrl = () => {
    const { shortCode } = useParams();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Please enter a password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await verifyPassword(shortCode, { password });
            // Redirect successfully authenticated user to the target URL
            window.location.href = data.targetURL;
        } catch (err) {
            setError(err.response?.data?.error || "Incorrect password");
            toast.error(err.response?.data?.error || "Incorrect password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-52px)] bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-800/50 shadow-sm">
                        <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Protected Link
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    This URL is password-protected. Please enter the password to continue.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white dark:bg-gray-900 px-6 py-10 sm:px-12 sm:rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className={`block w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ${error
                                        ? "ring-red-500 focus:ring-red-500"
                                        : "ring-gray-300 dark:ring-gray-700 focus:ring-purple-600 dark:focus:ring-purple-500"
                                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
                                    placeholder="Enter password"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="password-error">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProtectedUrl;
