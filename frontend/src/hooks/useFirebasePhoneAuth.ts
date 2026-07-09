import { useState, useRef } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export function useFirebasePhoneAuth() {
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  function getRecaptcha(containerId: string) {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  }

  async function sendOtp(mobile: string, recaptchaContainerId = "recaptcha-container") {
    setError("");
    setLoading(true);
    try {
      const e164 = mobile.startsWith("+") ? mobile : `+91${mobile}`;
      const verifier = getRecaptcha(recaptchaContainerId);
      const result = await signInWithPhoneNumber(auth, e164, verifier);
      setConfirmationResult(result);
      return true;
    } catch (e: any) {
      setError(e.message || "Could not send code");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(code: string) {
    setError("");
    if (!confirmationResult) {
      setError("Please request a code first");
      return null;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (e: any) {
      setError(e.message || "Incorrect or expired code");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { sendOtp, verifyOtp, loading, error };
}
