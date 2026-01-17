import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SsoCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">Completing sign in...</h2>
        <p className="text-gray-400">Please wait while we redirect you.</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}