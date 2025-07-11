import React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    ref?: React.Ref<HTMLInputElement>;
}
export declare const Input: React.ForwardRefExoticComponent<Omit<InputProps, "ref"> & React.RefAttributes<HTMLInputElement>>;
export default Input;
//# sourceMappingURL=Input.d.ts.map