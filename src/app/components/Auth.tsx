"use client";
import { useState } from "react";
import { auth, provider } from "@/app/firebase";
import { 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Auth() {
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // Validate email format
  const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

  // Validate password length
  const validatePassword = (password: string): boolean => password.length >= 6;

  // Handle email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  // Handle password validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!validatePassword(e.target.value)) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  // Handle confirm password validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };
  
  const signUpWithEmail = async (): Promise<void> => {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (emailError || passwordError || confirmPasswordError) return;
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsSignUp(false); // Redirect to sign-in form after successful signup
    } catch (err) {
      const errorCode = (err as any).code;
      if (errorCode === "auth/email-already-in-use") {
        setError("This email is already in use. Please sign in instead.");
      } else {
        setError((err as Error).message);
      }
    }
  };
  

  const signInWithEmail = async (): Promise<void> => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (emailError || passwordError) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex justify-center text-black items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {user ? (
          <>
            <p className="text-center font-semibold text-lg">Welcome, {user.displayName || user.email}!</p>
            <button 
              onClick={() => signOut(auth)} 
              className="bg-red-500 text-white px-4 py-2 rounded w-full mt-4"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            {!isSignUp ? (
              <>
                <h2 className="text-xl font-bold text-center mb-4">Sign In</h2>
                
                <div className="mb-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    className="border p-2 rounded w-full min-h-[40px]"
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{emailError}</p>
                </div>

                <div className="mb-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="border p-2 rounded w-full min-h-[40px]"
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{passwordError}</p>
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <button 
                  onClick={signInWithEmail} 
                  className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2"
                >
                  Sign In
                </button>

                <button 
                  onClick={() => setIsSignUp(true)} 
                  className="bg-purple-500 text-white px-4 py-2 rounded w-full mt-2"
                >
                  Sign Up
                </button>

                <p className="text-center my-4">or</p>

                <button 
                  onClick={() => signInWithPopup(auth, provider)} 
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  Sign In with Google
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-center mb-4">Sign Up</h2>

                <div className="mb-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    className="border p-2 rounded w-full min-h-[40px]"
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{emailError}</p>
                </div>

                <div className="mb-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="border p-2 rounded w-full min-h-[40px]"
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{passwordError}</p>
                </div>

                <div className="mb-2">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="border p-2 rounded w-full min-h-[40px]"
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{confirmPasswordError}</p>
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <button 
                  onClick={signUpWithEmail} 
                  className="bg-purple-500 text-white px-4 py-2 rounded w-full mt-2"
                >
                  Sign Up
                </button>

                <button 
                  onClick={() => setIsSignUp(false)} 
                  className="bg-gray-500 text-white px-4 py-2 rounded w-full mt-2"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
