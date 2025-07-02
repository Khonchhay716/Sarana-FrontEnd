import { useNavigate } from "react-router-dom"; // ✅ Correct import
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { FaUserPlus } from "react-icons/fa";
import { FaShieldHalved } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import DropdownManu from "../../CustomHook/DropdownManu";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { useRefreshTable } from "../../AllContext/context";
import { useEffect, useState } from "react";
import useFetchDataApi from "../../CustomHook/FetchDataApi";
import { MdEmail } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";
import { FaBell } from "react-icons/fa";
// import Offcanva from "../../CustomHook/Offcanva";
const Header = () => {
    const navigate = useNavigate(); // ✅ Hook for navigation
    const { setRefreshTables } = useRefreshTable();
    const { darkLight, setDarkLight } = useGlobleContextDarklight();

    const [dataUser, setDataUser] = useState<any>();
    const { data } = useFetchDataApi("https://localhost:7095/api/User");
    // console.log(dataUser);
    useEffect(() => {
        const email = sessionStorage.getItem("email");
        if (data && email) {
            setDataUser(data.find((item: { email: string }) => (item.email == email)));
        }
    }, [data]);
    const handleSelect = (value: string) => {
        // navigate(`/option/${value.toLowerCase().replace(" ", "-")}`);
        if (value === "Log Out") {
            const confirm = window.confirm("Are you sure you want to logout?");
            if (confirm) {
                navigate("/");
                sessionStorage.removeItem("token"); // ✅ Remove it
                sessionStorage.removeItem("email");
                setRefreshTables(new Date());
            }
        } else if (value == "My Account") {
            navigate("/myprofile");
        }else if(value == "Reset Password"){
            navigate("/reset-password");
        }

    };

    const dataOrdered = [
        {
            profile: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
            option: "Mrr Khmer",
        },
        {
            profile: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
            option: "Mrr test",
        },
        {
            profile: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
            option: "Mrs Test",
        },
        {
            profile: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
            option: "Mrr new ",
        },
    ]
    return (
        // The Header nav itself also needs a good z-index if it's sticky
        <nav className={`navbar px-4 w-[100%] h-[60px] bg-white-400 shadow-2xs shadow-amber-400 m-auto flex justify-center items-center sticky top-0 z-40 ${darkLight?"bg-gray-900":"bg-white"}`}>
            <div className="nav-brand w-[20%] flex items-center">
                <img src="https://marketplace.canva.com/EAGQJOtMpq8/2/0/1600w/canva-brown-modern-circle-coffee-shop-logo-TCp6UxDtpus.jpg" className="w-[45px] h-[45px] rounded-full bg-amber-300" alt="" />
                <span className="text-lg font-bold ml-3 hidden md:block" style={darkLight ? { color: "white" } : { color: "black" }}>Coffee</span>
            </div>
            <div className="nav-item w-[80%] flex justify-between">
                {/* Search bar and menu icon (commented out in your code) */}
                <div className="flex items-center">
                    {/* ... (commented out code) */}
                </div>

                <div className="icons flex items-center">
                    {/* Dark/Light Mode Toggle */}
                    {!darkLight ? <MdDarkMode onClick={() => setDarkLight(!darkLight)} className="w-[40px] h-[40px] p-2 rounded-full cursor-pointer bg-sky-100 hover:bg-sky-200" /> : <MdLightMode onClick={() => setDarkLight(!darkLight)} className="w-[40px] h-[40px] bg-sky-100 p-2 rounded-full cursor-pointer hover:bg-sky-200" />}

                    {/* Language Dropdown */}
                    <DropdownManu
                        label={<TbWorld className="hidden sm:block w-[40px] h-[40px] p-2 bg-sky-100 rounded-full hover:bg-sky-200 ml-3" />}
                        options={[
                            { profile: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/960px-Flag_of_Cambodia.svg.png", option: "khmer" },
                            { profile: "https://i.ebayimg.com/images/g/0~gAAMXQ9qpRTk04/s-l1200.jpg", option: "Enlish" }]}
                        onSelect={handleSelect}
                        shoeProfilr={true}
                        iconsHideDropdown={true}
                        // Added inputClass for z-index
                        inputClass={"w-[200px] z-[999]"}
                    />

                    {/* Cart Dropdown */}
                    <DropdownManu
                        label={<FaCartShopping className="w-[40px] h-[40px] bg-sky-100 p-2 rounded-full cursor-pointer hover:bg-sky-200 ml-3" />}
                        options={dataOrdered}
                        textHeade="Ordered"
                        onSelect={handleSelect}
                        iconsHideDropdown={true}
                        shoeProfilr={true}
                        headerShow={true}
                        footerShow={true}
                        // Added inputClass for z-index
                        inputClass={"w-[300px] -ml-[100px] z-[999]"}
                    />
                    {/* Cart Count - its z-index here is fine as it's a bubble, not meant to be covered by dropdowns */}
                    {/* <div className="text-white flex justify-center items-center -mt-10 -ml-3 z-10 w-[30px] h-[20px] rounded-full bg-red-500">{count}</div> */}

                    {/* Email Dropdown */}
                    <DropdownManu
                        label={<MdEmail className="hidden md:block w-[40px] h-[40px] rounded-full p-2 bg-sky-100 hover:bg-sky-200 cursor-pointer" />}
                        options={[
                            { profile: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg", option: "option1" },
                            { profile: "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg", option: "option2" }]}
                        onSelect={handleSelect}
                        shoeProfilr={true}
                        iconsHideDropdown={true}
                        headerShow={true}
                        textHeade="Message(12)"
                        footerShow={true}
                        textButton="Show all"
                        showIconItem={true}
                        // Changed z-10 to z-[999] for the dropdown content
                        inputClass={"w-[250px] z-[999]"}
                    />

                    {/* Notification Dropdown (already had z-[999]) */}
                    <DropdownManu
                        label={<FaBell className="hidden md:block w-[40px] h-[40px] bg-sky-100 p-2 rounded-full cursor-pointer hover:bg-sky-200 ml-3" />}
                        options={[{ profile: "", option: "option1" }, { profile: "", option: "option2" }]}
                        onSelect={handleSelect}
                        iconsHideDropdown={true}
                        shoeProfilr={true}
                        // This was already z-[999], which is good.
                        inputClass={"w-[300px] -ml-[200px] z-[999]"}
                        footerShow={true}
                        headerShow={true}
                        textHeade={"Notification(112)"}
                        settingHide={false}
                        textButton={"SHOW ALL ITEM"}
                    />

                    {/* Profile Dropdown */}
                    <DropdownManu
                        label={
                            <div className="profile w-[140px] h-[45px] rounded-2xl bg-sky-100 hover:bg-sky-200 ml-7 flex items-center cursor-pointer">
                                <img src={dataUser?.profilePicture??"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAvVBMVEWJ1v////8Ahf8Agv8Agf+N2f8Af/+K1/+C1P+O2v+A0/8Aff8Ah//3/P8Ae//c8v/p9/+m4P9xxv/Q7v+Y2//G6v+w4//w+v/j9f+85/9mvv99z/+W2v89o/8fkP/N5f8jlP93yv8Ri/+01v8Xjf9MrP9fuP8olv/W8P/g7//H4f+hzP+83P+Uw/9sr/9Xs/83nv9lvf9Fp//V6f+ax/98uP9usf9Ypf+x1/9gqf+Evf9Sr/9Pnf+q0P9kp//1iHdFAAAQUUlEQVR4nNWdCXfiOAzHE+zYHIGGo9BCOUpp05aWMkOPoQP7/T/W2kk4c9mRAp3/vrf7drZL8yO2JcuyZJi5q+pcNC+v2/VW68bihmFw66bVqrevL5sXTjX/X2/k+NlV5/G63uLlopRxLO9Py7xVv27mCpoXodNst6wosLDET/FWu+nk9CR5EDqXda4Gd4Bp1C/zoMQmrD62xbDUgtvDLPP2I/aIRSXsNOtGVrrtuzTqzQ7mQyESwvE2lEarifdYWIRXbc2JlwJZbF8hPRkKYfWylXnuxap8c4kyJREInWuk0XmsIm8jLK5gQqeOOjyPGIt18GAFEl61yrnh+Sq3gIwgwqt63nwIjABCMT5PwCdVrAPmY2bCavtUfB5jO/O6mpXwMsf1JRLRuDwp4dXNafk8xpts0zET4UkH6B5j+0SEFzkZeAXE4uMJCKvtU1iIWEb9FUeX8Mo61wsMEK2LfAmvz8vnMV7nSNhpnR9QILa0dsg6hBfnZttKZ6RqEF7+hBfoq6hh/tUJT+aFqqhYRyesnsGLSVLxRnUyKhI61rmRQuKKTpwa4c9ZY/altt4oETbP6cbEq6wUc1QhvPyZgAJRZUlVIPwBfkycVKxGOuEPBlRy4VIJr3/qEPVVTkVMI/zRb1AqdaCmEP4gTy1OaYjJhD/UTBwqxWgkEl78C4ACMdH0JxE65350ZSUFjBMIqz/PF42TlRC9SSC8Ofdza+gmC+GP2g+mKWG/GEv4D9iJfcXbjDjCi38LUCDGLagxhJ1zP3AGxWz6Ywhb537cDGrpEP54bzRKMfuMSMJ/bhL6ip6KUYQ5mXrOLatUKlmbv3OO/RsiDX8UYQ7Hg1xQ9boPfdcdSbnz/v1D97YoQDExIw8YIwjR/W2B13vojwuUEqlCwfsHpYXCoP/QKyG+zHLE+WIEIdavC8St3tuIUQEWIULZuN8to73JYnichglxxyi3GvMCjaTbUY77DY4z9yPGaYjwChOQlxouiX57R5CDBwOFsRiKhIcIMXcUVnkeMzrDooU3FMbQLuOYENPhtrq2Kp/HOH5AWHNCLvgRYRUT8D55/kUwurcl8K89XmyOCPGWGW7NdQGlGflbgr7G48XmkNDBAzRcfUDvNZahs7HoJBDWUegM6aFleIP+axzfQhHr8YR4liLLEN0g2g0g4qHFOCDEeIXCvRaudT8zoGSEItbjCK/gDqnFew+/3dFYx0qERYGI5asYQvDGnvOuS6iKE5Mi+xa2oraiCcGv0OqNlF2YZJGBAUIsO5GE0FloNZD4hOgcNk7rUYRQW2g10PiE2C8QYrETQQh0Z3hvjAgopmIZMk73olJbwiqIzzBgBiIs8hvkovJqiBC4qeANhgooEEHr6W6LsSUE7gtLI8xZ6BH2QTPx5pgQaCp4A3eMeog9yEvcWv0NYRsEKGYh9isUhPeQl7jdRG0IgbOwbKMDCoHWmuIhYRNGaP3CH6TCJjZAa03zgBDoz1g5DFJpMEBrTX2fEHxcOMkBsFAYw/zvzh4hcJDyXh6DVAhmEpt7hNBBmss0FP43zDmt7wihHpt1n8c0BE9Eo7olfARuK0puiJDYCPaDuDB78bglhEZJS+PQs02enhEc1QHosXyj7xFCg7BWGEb4TC81MOEY5LgZfEPoAMMXvHdMyIbys+/gbxFG6AUzDPjGKex2s1ff2L5AFyAKi0h5WygDbisMq3tISAab7eczMHLDgDG3ekAIBDSsh0NCtt7szcyFDbKUFOSZ+hPRQDiOsd4OMcbmTp0VZDLSLswgykMaA+yyhQx+ZW3uawZYUoFOjee4GQhnhtbvA8KJeagpyzwZwYRtjxAczD8kZNMjQnMxzjoZoYQyvG+YVfDZ+eHucByRejXLOBnBhFZVEMLPfQ8I6XcYUBj/bGsq7QK/frHUGGC3+4iQPEURms4yy4IDtRbS+TYQckn35yH5igQUehmrDlWyjb1CLb6M7hsIB7/7hOwljtA0v4naUGWLzXcB9NqE2oIQnvB8sJbGA5rm07KiYDgqr+Ym7GPDPG9DLqYGeOskCP9un5t+JBEKwzGvpTEyMc7nwQ+NQQdQUtw0qgiH9zuvrTZMJjTN4YomjlW2Ej/0EfwIbAcsVa4aCElCe573sT8Tybgk8WtOZSl/5NX/QOKCc/mKjoGQtb7bPdFPBUIxH1/HtcgXSYnv0079rwB4/OQRXhhgv3t/B1xJWEkP9Twjx3nDhLGP4HA6iA7Qv3DCpoGQbrkXxdCpHPf84dqM0SDpu0Lc9+3h+0vFJ4S6NHKbb2BcHikGhGSlASh1NZx+LL9Wq9Xs+27fF3r2CWHHwP6jXRvAg0NPJao1DdM19AlthG+/bWDkspUCC83W6Q+vpIXvxI7g+bSCD+MOVymw0OwZidB/h9CgvqcWDmEQxojZV+jLn4fg3aFUy0DIzbdug1FqY5Wp9tdS2kUYpTcINwCsh42xsJEAxTz0EhzpA8LTwXIAvY/YxYPH6c+uqPXXSMavoNFEQyacg513mYYRbPzwCIUWKwrNbvMJoZK3Kujsm6KOUl9f4pNBOTU4jCX5Cs2hNxVt3N4GVTFObehiAx6l/JbKba8z9ha/BSqh3CaC4xgcupbKvWFFGPovufaxO1xCYTTAy6kFtYfyzKLWCfY78YG2bOrUgMlthrSHQJ9Gxkrtqmk6vleD5dT4qiJsgsFe24bQG6YUe6mxMQihyUK/SYFJwucaq61S41CahBW4912H7g9lnM0PsC3WWD03thrW4CtNG7rHlzEa+oqNFuiVgk8uxB4fnIhRUIshZpHcskAPLi7BsTaZ/5weB84kMUhJH+jTFJvgeKm8hkBnuRDOKDBN2PDipeCYNx+gO6S+HOHxDsC3gh34uYVcTcNn9wiaisHxBt1alKvwsyfeE3Z5lAPhiCCcrnGM80Pp1lSwomw7PVcwzi1aGGfAvEH0o93pWolPha4z/hkwPKwvU4RryFtDGRQGpghLeef48FwMaTCwN07SkwebiiAXA+GItCQMRgXX6suwyAChSIbMp0Goe2V1GfZMFLOQwUOJfk4URvU5LmaibxOHoyWk4111OfLGgrCFxEUordTCyU30l9MCGZrVNSUViAs3qxC6rppD+XHwWbjJTUQ45xYbYRkwdScyWgNYVr1TNTZxZdwO4+ApyC9FKdnCB/JrDzIoMhMGN1PkR40wyn8FOcIIOUOCsDiSJ/K0INxl9p4R8F0MAbvgfc6oiPJUJk6uvv9hxsPcnd/f3pLMIbcn7+j+9l58zgPCeYOxy9VHqn5llcRfXM7IjJZDWAgx+7j3OShPtL1vAb0zcyBuiBnJUtLbIvXBwBU/jrS9M4MyEbficpzW9OP7dzWU9JKDRzFNpLtrhyq9Mc846mkozA17QzjW3mnv7hrc+T6QLBJFbL3V5skWkxC+HTzQ3v1D6B3SI3FDbM/1ECUgGaFOQmP/DileFTNfvDzRQ/QAJ+AT7SPt3QNGcdz2xXvykW3Vufjs/TQ4JnOkg7vc6OW7LQ+RqmWBCXddAqJXL96/j489TCWidFRrnwpbqU9pJib4gAc1FdCHqZyLI7n+j9KCcMORsC10hD0HQ3UxgLVNosR5X9pF+pmUCtb5lInCrI9f+fq4tgm0Pk2krAc/d/s7jrET3DF5QK157StUnwahomBYQVYmo59Rm+LFJ/WycMgc1ZMJFKoxlEtHEu9yqXxLlLkfz/unN87zt8u8/wKtJRSnUJ2oXDp2yGQb+kFlDh6hzB4tv6fru/X0ezmyvUR9wqhMCkLIQAwpotYXsufmiXepjKNOg4LlYuvOpPzakeJfBlOZDYyQkR/xq8P12nKppi8J5RWM4ceA7V+vkKiDT+nyvORDGFVzD7GG8FZbQjFEnqafK7vmy159Tp/8LzkvQieCEN+v8ebhwRl/9WmxWDzt+zkYCSURiqx9iRvM8CSv7dWSD8Cfahh3f44VU78Uv7mMZw+TPVMvdQ3dHsbUoMW3+nyQHh52SWGA/Q5j6wijb4RvFS4KfVJgSa8IxdaCxu384C80qUm1dwx9qUmo5438EuWZW2qmjWPjnKPtKaEmO65NlCngCoffXwThUvq+Euvqozo2ciVNup4f6IXh7i6SeyNgeqde/sIgFdA05SkA5ktM7m+BuMXgI6IW3L+rIZ0WekrrUYK3TyzdU9WzUrEg0XuscRrqL5dXryCvWKTiDZMFRbpraCj1CsJZbKxGYVe2LVWvMpoBbfngSaXfE7y4meyxJnMzqHqa1JcMaHRLJXhEKgIn/Eegvmvc4uVuX1YU0kpYcL3bGv1umYMgo3ofo/bO45Zx+yY7XMiEAwVTuNOLH3WjxP17a2SGVO2dlzEPTHz7jd8DsotVUPWUjHeyi2+Qwe9Gxjep3P8wSw9Lq9S7Hx91J2ErtfO1p6O6fISM73sZkhXC62gsoW7OqRidXTei7hypfaSfzFS/I4ryEOb+0h2tOn1INbf7VvltElPkko1fk2+wd95jCmQROnnTa26l1UtW50DRMt6Sauox+zt+rD592wkFwOhYq52eXj9g5aloWW9pxeYoc9+jIK+mfmA/6X+13yxFRt2ezoouOLcaA4UKZYTVBp/ThbP5ljvOYvo5qKlUjKSDhtJ01O/LrdRbXaODI6GsRibu6uu/r5U7IbW4xqQRjHOF6Zilt3r6LoOXfml1cCwETWR1O14R+1dqy8BQ50olwhTDbxXn2K1l4sTmxZRnSTBKCYSmk/ihDWBzNR2RcfLOIynclUSY5INbb6fj8xgT7nhF+duKhGYzBpFbyN2d0kX7cWtquZnIkEwYk4UiU55PDBifkRJvJ5QII82inw10cpFBVFZRGmAqoXkdGqhWb3IOQLnehBHL0e62DmFon2H1CucBlLcUjhFj9hN6hEcD1brVNfOYiPZho9nUIapGaF7uDVTeO6EZjEA86HhRVgBUItwzGl4m/jm1n82fYiZ0CM2LLSF6izxtxN0BQKKh1yQ0HX/4n97Qh7W58mUp1gBQJDSrN8VwI4vzyDsyLt6oXnNUJZT7RY7aSzW7SIMn7AezE4oldXxutkBjpUVUnxDcNQZLhOrUN9AhNJ9Gp9rzJokNtK7jaBGa5odK2fh8VdG8F6dJaL5k7jeCIzr+o/nEuoSm8wVvNpZdtS/tSjjahKZ5l1wYP0dRmqFsYQZCs7PM3v0HIMJmWYoZZCEUs3Fw+kWVDXSOXKGEZvX1xEOV0teM1SgyEprm1eyEhoNUZplrbWUmNM3h/ETTkbA5oDQMgFC4cavUnioIfLVVtgmIQSgY3ZwZSc0F8YEJxVj9ynHNoXQFLiIGJpR30Ar5TEhWmCGUZkIgFJ7c6yC6bwxApDb5RqlViEIo9LxkiC+SMLbEqnGHRSh8ufWcoECKT1mtsbosYBIKPU2/aFp6RYqowIvM3MgsVEIh58+MKCVZRL68WmG2xi4Uik0oNXzv20w92cKDk+9+/ppHLds8CKWG62XQzSmNTd62LLizdT6VevMjlLparL//GxVqFUF6jCqbWDFWqRVG/31MF7il3A+VJ6GvqjP8M33/WM7dwWRsCzh7PBm48+XH+/TPsAMp0Kem/wFDOUmAWUcc+gAAAABJRU5ErkJggg=="} className="w-[40px] h-[40px] rounded-full border-2 mr-1.5 border-indigo-500" alt="" />
                                <div className="">
                                    <h4 className="text-md -mt-3 font-bold ml-[-10px]">{dataUser?.name ?? "Name"}</h4>
                                    <p className="-mt-0.5 -ml-1.5 text-[10px]" >{dataUser?.email ?? "@Test.come"}</p>
                                </div>
                            </div>
                        }
                        options={[{ iconsItem: <FaUserPlus />, option: "My Account" }, { iconsItem: <FaShieldHalved />, option: "Reset Password" }, { iconsItem: <IoIosLogOut className="text-red-500" />, option: "Log Out" }]}
                        onSelect={handleSelect}
                        showIconItem={true}
                        iconsHideDropdown={true}
                        // Changed z-10 to z-[999] for the dropdown content
                        inputClass="-ml-[40px] z-[999]"
                    />
                </div>
            </div>
        </nav>
    )
}

export default Header;