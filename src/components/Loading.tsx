import React from "react";

interface LoadingProps {
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({ size }) => {
    const spinnerSize = size ? `${size}` : '4'; // Default size is 48px
    return (
        <div 
            className={`inline-block h-${spinnerSize} w-${spinnerSize} animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
            role="status">
        </div>
    );
}

export default Loading;