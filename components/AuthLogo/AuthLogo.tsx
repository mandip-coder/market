import GradientText from "@/components/GradientText/GradientText";
import React from "react";

interface AuthLogoProps {
    className?: string;
}

const AuthLogo: React.FC<AuthLogoProps> = ({ className }) => {
    return (
        <GradientText
            colors={["#2264d1", "#C53E91", "#2264d1", "#C53E91", "#2264d1"]}
            animationSpeed={3}
            showBorder={false}
            className={`text-4xl md:text-5xl font-bold tracking-tight ${className}`}
        >
            Market Access
        </GradientText>
    );
};

export default AuthLogo;
