'use client'
import {
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  ShieldAlert,
  ServerOff
} from "lucide-react";
import { Button } from "antd";
import { useRouter } from "next/navigation";

const statusDescriptions: Record<number, string> = {
  400: "Bad Request - The server couldn't understand the request",
  401: "Unauthorized - Authentication is required",
  403: "Forbidden - You don't have permission to access this resource",
  404: "Not Found - The requested resource doesn't exist",
  405: "Method Not Allowed - The HTTP method is not supported",
  408: "Request Timeout - The server timed out waiting for the request",
  410: "Gone - The resource is no longer available",
  429: "Too Many Requests - You've exceeded the rate limit",
  500: "Internal Server Error - The server encountered an unexpected error",
  502: "Bad Gateway - The server received an invalid response",
  503: "Service Unavailable - The server is currently unavailable",
  504: "Gateway Timeout - The server didn't receive a timely response",
};

const getErrorInfo = (code?: number) => {
  if (!code) {
    return {
      icon: AlertCircle,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-100 dark:border-red-900/30",
      textColor: "text-red-600 dark:text-red-300",
      buttonBg: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
    };
  }

  // Client errors (4xx)
  if (code >= 400 && code < 500) {
    switch (code) {
      case 401:
      case 403:
        return {
          icon: ShieldAlert,
          color: "text-amber-500 dark:text-amber-400",
          title: "Authentication Error",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-100 dark:border-amber-900/30",
          textColor: "text-amber-600 dark:text-amber-300",
          buttonBg: "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
        };
      case 404:
        return {
          icon: XCircle,
          color: "text-blue-500 dark:text-blue-400",
          title: "Not Found",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-100 dark:border-blue-900/30",
          textColor: "text-blue-600 dark:text-blue-300",
          buttonBg: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        };
      case 429:
        return {
          icon: AlertTriangle,
          color: "text-orange-500 dark:text-orange-400",
          title: "Rate Limit Exceeded",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-100 dark:border-orange-900/30",
          textColor: "text-orange-600 dark:text-orange-300",
          buttonBg: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-yellow-500 dark:text-yellow-400",
          title: "Client Error",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          borderColor: "border-yellow-100 dark:border-yellow-900/30",
          textColor: "text-yellow-600 dark:text-yellow-300",
          buttonBg: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
        };
    }
  }

  // Server errors (5xx)
  if (code >= 500) {
    return {
      icon: code === 503 ? ServerOff : AlertOctagon,
      color: "text-red-600 dark:text-red-400",
      title: "Server Error",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-100 dark:border-red-900/30",
      textColor: "text-red-600 dark:text-red-300",
      buttonBg: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
    };
  }

  return {
    icon: AlertCircle,
    color: "text-red-500 dark:text-red-400",
    title: "Error",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-100 dark:border-red-900/30",
    textColor: "text-red-600 dark:text-red-300",
    buttonBg: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
  };
};

export default function AppErrorUI({
  message,
  onRetry,
  code,
  backLink,
  buttonName="Go Back"
}: {
  message?: string;
  onRetry?: () => void;
  code?:400 | 401 | 403 | 404 | 405 | 408 | 410 | 429 | 500 | 502 | 503 | 504
  backLink?: string
  buttonName?: string
}) {
  const errorInfo = getErrorInfo(code);
  const router=useRouter()
  const { icon: ErrorIcon, color, bgColor, borderColor, textColor, buttonBg } = errorInfo;
  const description = code ? statusDescriptions[code] : undefined;
  
  return (
    <div className="flex min-h-full h-[calc(100vh-5rem)] items-center justify-center px-4 bg-gray-50 dark:bg-black rounded-2xl" >
      <div className="max-w-md w-full text-center shadow-lg p-8 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <ErrorIcon className={`h-16 w-16 ${color}`} />
        </div>
        {!code && <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          {message && `${message}`}
        </h2>}

        {code && statusDescriptions[code] && (
          <div className={`mt-4 p-4 ${bgColor} rounded-lg border ${borderColor}`}>
            <div className="flex items-center justify-center space-x-2">
              <span className={`text-3xl font-bold ${textColor}`}>{code}</span>

            </div>
            {description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description.split(' - ')[0]}
              </p>
            )}
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              {message && `${message}`}
            </h2>
          </div>
        )}

        {onRetry && (
          <Button
            onClick={onRetry}
            className={`mt-6 ${buttonBg} text-white font-medium py-2 px-6 rounded-lg transition-colors`}
          >
            Retry
          </Button>
        )}
        {
          backLink && (
            <Button
            onClick={()=>router.push(backLink)}
            className={`mt-6 ${buttonBg} text-white font-medium py-2 px-6 rounded-lg transition-colors`}
          >
            {buttonName}
          </Button>
          )
        }
      </div>
    </div>
  );
}