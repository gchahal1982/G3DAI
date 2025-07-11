import React from 'react';
interface SelectOption {
    value: string;
    label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options?: SelectOption[];
}
export declare const Select: React.FC<SelectProps>;
export default Select;
//# sourceMappingURL=Select.d.ts.map