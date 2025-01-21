import React, { useState, useEffect } from 'react';
import { BiSearchAlt2 } from "react-icons/bi";
import OtherUsers from './OtherUsers';
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '../utils/config';

const Sidebar = () => {
    
    const [search, setSearch] = useState("");
    const [isInputDisabled, setIsInputDisabled] = useState(false);   // Track input disabled status
    const [loading, setLoading] = useState(false);                  // Track loading state for users fetching

    const { otherUsers } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch all users from the backend only if the store is empty or loading
    useEffect(() => {
        if (!otherUsers || otherUsers.length === 0) {
            fetchOtherUsers();
        }
    }, [otherUsers]);

    const fetchOtherUsers = async () => {
        try {
            setLoading(true); // Set loading to true while fetching users
            axios.defaults.withCredentials = true;
            const res = await axios.get(`${BASE_URL}/api/v1/user`);
            dispatch(setOtherUsers(res.data)); // Save other users in the Redux store
        }
         catch (error) {
            toast.error("Failed to fetch users.");
            console.log(error);
        } 
        finally {
            setLoading(false); // Set loading to false after data is fetched or error occurs
        }
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
            navigate("/login");
            toast.success(res.data.message);
            dispatch(setAuthUser(null));
            dispatch(setMessages(null));
            dispatch(setOtherUsers([])); // Clear the users in the Redux store
            dispatch(setSelectedUser(null));
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
            console.log(error);
        }
    };

    const searchSubmitHandler = (e) => {
        e.preventDefault();

        if (!search.trim()) {
            fetchOtherUsers(); // Reset to show all users if the search is empty
        } else {
            const conversationUser = otherUsers?.find((user) =>
                user.fullName.toLowerCase().includes(search.toLowerCase())
            );
            if (conversationUser) {
                dispatch(setOtherUsers([conversationUser])); // Filter the user list
                setIsInputDisabled(true); // Disable input field after search
            } else {
                toast.error("User not found!");
            }
        }
    };

    const clearSearchHandler = () => {
        setSearch(""); // Clear the search box
        fetchOtherUsers(); // Show all users again
        setIsInputDisabled(false); // Re-enable input field
    };

    return (
        <div className='border-r border-slate-500 p-4 flex flex-col'>
            <form onSubmit={searchSubmitHandler} className='flex items-center gap-2'>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='input input-bordered rounded-md'
                    type="text"
                    placeholder='Search...'
                    disabled={isInputDisabled || loading} // Disable input when isInputDisabled is true or loading is true
                />
                <button type='submit' className='btn bg-zinc-700 text-white'>
                    <BiSearchAlt2 className='w-6 h-6 outline-none' />
                </button>
                {search && (
                    <button
                        type="button"
                        onClick={clearSearchHandler}
                        className="btn bg-red-500 text-white"
                    >
                        Clear
                    </button>
                )}
            </form>
            <div className="divider px-3"></div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <OtherUsers />
            )}
            <div className='mt-2'>
                <button onClick={logoutHandler} className='btn btn-sm'>Logout</button>
            </div>
        </div>
    );
};

export default Sidebar;
