"use client";
import Loading from "@/components/Loading";
import { useAppData, user_service } from "@/context/appContext";
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const {isAuth, loading:userLoading} = useAppData();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });
      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  if(userLoading){
    return <Loading/>
  }
  if (isAuth) {
    return redirect("/chat");
  }
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full ">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Mail size={40} className="text-white" />
            </div>
            <h1 className="text-4xl text-white font-bold mb-3">
              Welcome to LoopChat
            </h1>
            <p className="text-gray-300 text-lg">
              Enter your email to Continue your journey
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white
                 placeholder-gray-300 "
                placeholder="enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg cursor-pointer font-semibold hover:bg-blue-700 disabled:opacity-lg
            disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5" />
                  sending otp to your mail...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Send Otp</span>
                  <ArrowRight className="w-5 h-4" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
