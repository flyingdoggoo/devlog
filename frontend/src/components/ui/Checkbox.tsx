import { cn } from '@utils/index';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className={cn(
          'appearance-none bg-[#212121] border border-[#333333] h-4 w-4 rounded',
          'focus:ring-0 cursor-pointer',
          'checked:bg-white checked:border-white',
          className
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="ml-2 block text-xs text-gray-400 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
