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

  // Handle email validation on blur
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  // Handle password validation on blur
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!validatePassword(e.target.value)) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  // Handle confirm password validation on blur
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
    <div className="text-center text-black p-4">
      {user ? (
        <>
          <p>Welcome, {user.displayName || user.email}!</p>
          <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </>
      ) : (
        <>
          {!isSignUp ? (
            <>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  className="border p-2 rounded w-full"
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="border p-2 rounded w-full mt-2"
                />
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <button onClick={signInWithEmail} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                Sign In
              </button>
              <button onClick={() => setIsSignUp(true)} className="bg-purple-500 text-white px-4 py-2 rounded">
                Sign Up
              </button>
              <p className="my-4 text-white">or</p>
              <button onClick={() => signInWithPopup(auth, provider)} className="bg-blue-500 text-white px-4 py-2 rounded">
                Sign In with Google
              </button>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Sign Up</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className="border p-2 rounded w-full mb-2"
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="border p-2 rounded w-full mb-2"
              />
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="border p-2 rounded w-full mb-2"
              />
              {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}

              {error && <p className="text-red-500">{error}</p>}

              <button onClick={signUpWithEmail} className="bg-purple-500 text-white px-4 py-2 rounded w-full">
                Sign Up
              </button>
              <button onClick={() => setIsSignUp(false)} className="bg-gray-500 text-white px-4 py-2 rounded w-full mt-2">
                Back to Sign In
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
