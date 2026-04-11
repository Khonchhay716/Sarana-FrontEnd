import { useState, useRef, useEffect, ReactNode } from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

interface DropdownOption {
  profile?: string;
  iconsItem?:string | ReactNode;
  option: string;
}
interface DropdownProps {
  label: string | ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  iconsHideDropdown?: boolean; 
  shoeProfilr?: boolean;
  inputClass?:string;
  headerShow?: boolean;
  textHeade?: string;
  textButton?: string
  footerShow?: boolean
  settingHide?:boolean
  showIconItem?: boolean
}
const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  options, 
  onSelect , 
  iconsHideDropdown,
   shoeProfilr, 
   inputClass,
   headerShow, 
   textHeade,
   settingHide,
   textButton, 
   footerShow,
   showIconItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex" >
        {label}{iconsHideDropdown? "":<MdOutlineArrowDropDown className="text-2xl mt-0.5"/>}
      </button>
      {isOpen && (
        <div className={`absolute z-10 mt-2 w-50 text-black border-1 border-black rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto scrollbar-hide bg-white ${inputClass}`} >
          {headerShow?<div className="w-[100%] h-[50px] bg-blue-100 flex justify-between items-center px-2 sticky z-30 top-0">
            <p className="text-xl font-bold">{textHeade??"NameHead"}</p>
            {settingHide?"":<IoMdSettings className="text-2xl cursor-pointer"/>}
          </div>:""}
          {options.map((option) => (
            <button key={option.option} onClick={() => { onSelect(option.option); setIsOpen(false);}} className="block w-full text-left px-4 py-2 bg-gray-200 hover:bg-gray-300 cursor-pointer mt-0.5">
              {shoeProfilr?<img src={option.profile} className="w-[40px] h-[40px] bg-white rounded-full border-2 border-amber-200" alt="" />:""}
              {showIconItem?<span className="text-2xl mt-1">{option.iconsItem}</span>  :""}
              <span className="mt-1 ml-2">{option.option}</span>
              </button>
          ))}
          {footerShow?<div className="w-[100%] h-[40px] bg-blue-500 text-white flex justify-center items-center text-md hover:bg-blue-700 cursor-pointer font-bold sticky bottom-0">{textButton??"SHOW ALL"}</div>:""}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
