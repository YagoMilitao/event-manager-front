import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <label className="flex flex-col w-full">
      <p className="text-black dark:text-white text-base font-medium leading-normal pb-2">
        {label}
      </p>
      <input
        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border-black/20 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-black/40 dark:placeholder:text-white/40 px-4 text-base font-normal leading-normal transition-all"
        {...props}
      />
    </label>
  );
};