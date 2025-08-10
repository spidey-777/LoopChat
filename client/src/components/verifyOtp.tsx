"use client";
import axios from "axios";
import { ArrowRight, ChevronLeft, Loader2, Lock } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/appContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
    const { isAuth, setIsAuth, setUser, loading: userLoading, fetchChats, fetchUsers } = useAppData();
    const [loading, setLoading] = useState<boolean>(false);
    const [otp, setOpt] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string>("");
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(60);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email: string = searchParams.get("email") || "";

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleInputChange = (index: number, value: string): void => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOpt(newOtp);
        setError("");
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ): void => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOpt(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pasteData.length; i++) {
            if (i < 6) {
                newOtp[i] = pasteData[i];
            }
        }
        setOpt(newOtp);
        setError("");
        inputRefs.current[pasteData.length - 1]?.focus();
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits')
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post(`${user_service}/api/v1/verify`, {
                email, otp: otpString
            })
            toast.success(data.message)
            Cookies.set('token', data.token, {
                expires: 15,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            })
            setOpt(["", "", "", "", "", ""]);
            setUser(data.user);
            setIsAuth(true);
            inputRefs.current[0]?.focus();
            fetchChats();
            fetchUsers();

        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred during verification.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setError("");
        try {
            const { data } = await axios.post(`${user_service}/api/v1/login`, {
                email
            })
            toast.success(data.message);
            setTimer(60);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to resend OTP. Please try again.");
            }
        } finally {
            setResendLoading(false);
        }
    }
    if (userLoading) {
        return <Loading />
    }
    if (isAuth) {
        redirect('/chat');
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full ">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                    <div className="text-center mb-8 relative">
                        <button className="absolute top-0 left-0 p-2 text-gray-300 hover:text-white"
                            onClick={() => router.push('/login')}>
                            <ChevronLeft className="w-6 h-6" />

                        </button>
                        <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                            <Lock size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl text-white font-bold mb-3">
                            Verify Your Otp
                        </h1>
                        <p className="text-gray-300 text-lg">
                            we have send a 6 digit otp to your
                        </p>
                        <p className="text-blue-400 font-medium">{email}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                                Enter the 6 digit Otp
                            </label>
                            <div className="flex justify-center in-checked: space-x-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        // This is the fix. Wrap the assignment in curly braces `{}`
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        className={`w-12 h-12 text-center bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        {error && (
                            <div className="bg-red-900 border border-red-800 rounded-lg p-3 ">
                                <p className="text-red-300 text-sm text-center">{error}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg cursor-pointer font-semibold hover:bg-blue-700 disabled:opacity-lg
            disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Verify Otp</span>
                                    <ArrowRight className="w-5 h-4" />
                                </div>
                            )}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-300 text-sm mb-4">
                            Didn&apos;t receive the code?
                        </p>
                        {timer > 0 ? (
                            <p className="text-gray-400 text-sm">Resend code in {timer} seconds</p>
                        ) : (
                            <div className="text-center mt-4">
                                <button
                                    className="text-blue-500 hover:text-blue-400 font-medium text-sm disabled:opacity-50 
                  disabled:cursor-not-allowed transition cursor-pointer"
                                    disabled={resendLoading}
                                    onClick={handleResendOtp}
                                >
                                    {resendLoading ? "Sending..." : "Resend Code"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;