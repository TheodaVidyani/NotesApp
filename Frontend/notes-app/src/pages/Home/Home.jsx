import React, { useEffect } from 'react'
import NavBar from '../../components/NavBar/NavBar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddeditNotes';
import Modal from 'react-modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import moment from 'moment';

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const navigate = useNavigate();

  //Get user Info
  const getUserInfo = async () => {
    try{
      const response = await axiosInstance.get('/get-user');
      if(response.data && response.data.user){
        setUserInfo(response.data.user);
      }
    }catch(error){
        console.log(error);
        if(error.response.status === 401){
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    //Get All notes - API integration
    const getAllNotes = async () => {
      try{
        const response = await axiosInstance.get('/get-all-notes');
        if(response.data && response.data.notes){
          setAllNotes(response.data.notes);
        }
      }catch(error){
        console.log(error);
      }
    };

useEffect(() => {
  getAllNotes(); 
  getUserInfo();
  return () => {}
  },
  []
);

  return (
    <>
      <NavBar userInfo={userInfo}/>
      <div className="container mx-auto">
        <div className='grid grid-cols-3 gap-4 mt-8'>
          {allNotes.map((item, index) => (
                    <NoteCard
                    key= {item._id}
                    title={item.title}
                    date={moment(item.createdOn).format("MMM DD, YYYY")}
                    content={item.content}
                    tags={item.tags}
                    isPinned={item.isPinned}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onPinNote={() => {}}
                  />
            ))}

        </div>
      </div>

      <button className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10" 
        onClick={() => setOpenAddEditModal({ isShown: true, type: "add", data: null })}
        >
        <MdAdd className="text-[32px] text-white" />
        </button>

        <Modal 
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}  // Close the modal
      style={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
      }}

      contentLabel=""
      className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-4 p-5 overflow-scroll"
      >
        <AddEditNotes 
        type={openAddEditModal.type}
        noteData={openAddEditModal.data}
        onClose={() =>{
          setOpenAddEditModal({ isShown: false, type: "add", data: null });
        }}/>
        </Modal> 
    </>
  );
};

export default Home;
