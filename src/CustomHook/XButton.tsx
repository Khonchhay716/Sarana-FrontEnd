
interface XButtonProps {
    type?: "submit" | "reset" | "button";
    onClick?: () => void;
    children?: React.ReactNode;
  }
  
  const XButton = ({ type , onClick, children }: XButtonProps) => {
    return (
      <button type={type} onClick={onClick}>
        {children}
      </button>
    );
  };
  
  export default XButton;
  