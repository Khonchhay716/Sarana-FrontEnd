import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface ItemMenu {
  item: string | ReactNode;
  to?: string;
}

interface IPropItem {
  NameManu?: string | ReactNode;
  items?: ItemMenu[];
  inputClassButton?: string;
  inputClassCanva?: string;
  NameHeader?: string;
  showProfileCanva?:boolean
  profile?:string
}

const Offcanva = ({ 
    NameManu, 
    items=[], 
    inputClassButton , 
    inputClassCanva,
    NameHeader,
    showProfileCanva,
    profile,

}: IPropItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button className={`m-4 px-4 py-2 text-black rounded cursor-pointer bg-none ${inputClassButton}`} onClick={() => setIsOpen(true)}>{NameManu??"Manu Item"}</button>

      {/* click any where will close Offcanva */}
      {isOpen && (<div className="fixed inset-0 bg-white bg-opacity-0 z-40 opacity-0" onClick={() => setIsOpen(false)}></div>)}

      {/* Offcanvas Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 shadow-lg z-50 transform transition-transform duration-500 text-black ${inputClassCanva} ${ isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b ">
            <div className='flex items-center'>
                {showProfileCanva?<img src={profile??""} className='w-[50px] h-[50px] rounded-full mr-2' alt="" />:""}
                <h2 className="text-lg font-bold">{NameHeader??"Manu"}</h2>
            </div>
            <button onClick={() => setIsOpen(false)}>✕</button>
        </div>
        {/* /// item  */}
        <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[100vh]">
          {items.map((item, index) => (
            <NavLink to={item.to || '#'} key={index} className=" hover:bg-gray-200 p-2 rounded" onClick={() => setIsOpen(false)} >
              {item.item}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Offcanva;
