import React, { useEffect } from "react";
import NavBar from "../../components/NavBar/NavBar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import moment from "moment";
import Toast from "../../components/ToastMessage/Toast";
import AddNotesImg from "../../assets/images/add-note.svg";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import NoDataImg from "../../assets/images/no-data.svg";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  }); //type: add, edit, delete

  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  const [isSearch, setIsSearch] = useState(false);
  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({ isShown: true, message, type });
  };

  const handleCloseToast = () => {
    setShowToastMsg({ isShown: false, message: "" });
  };

  //Get user Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      console.log(response); // Check if the response exists and is structured correctly

      //I got an error in my vite console, Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'status') at getUserInfo (Home.jsx:52:27). This suggests that somewhere in my getUserInfo function, I am trying to access the status property from a response or object that is undefined. This usually happens when the response from the API (or some other asynchronous operation) is either undefined or the object you are trying to access hasn't been properly initialized.
      //So I had to check the API call and the response structure to ensure that the response.data object exists and has the user property before trying to access it. I added a console.log(response) check to ensure that response.data and response.data.user exist before trying to access the user property. And the results came our error free.

      // Assuming response.data holds the data
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
        console.log("User info set:", response.data.user);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  //Get All notes - API integration
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      console.log("Fetched Notes:", response.data.notes);
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("Unexpected Error occured. Try again later.");
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  //Delete note
  const deleteNote = async (data) => {
    const noteId = data._id;

    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Note deleted successfully.", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("Unexpected error occured. Please try again later.");
      }
    }
  };

  // Search Notes API integration - The intergration will happen in Frontend Home.jsx as the APi creation happned in Backend index.js.
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      consol.log(error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(
        "/update-pin-status/" + noteId,
        {
          isPinned: !noteData.isPinned,
        }
      );
      if (response.data && response.data.message) {
        showToastMessage("Note Updated Successfully.");
        getAllNotes();
      }
    } catch (error) {
      console.log("Unexpected error occured. Please try again later.");
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <NavBar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto">
        {/* This code snippet is a conditional rendering block in a React component that displays a list of notes or an empty state based on whether any notes exist. */}

        {/* The code uses a ternary operator to determine what to render based on the length of the allNotes array:
      
      {allNotes.length > 0 ? (
    // If there are notes, render this part
      ) : (
    // If there are no notes, render this part
      )}
      
      */}
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item, index) => (
              // Mapping Over allNotes:

              //allNotes.map(...): This iterates over the allNotes array. For each note (item), it creates a NoteCard component.
              //The key prop is set to item._id to uniquely identify each note.
              //The title, content, date, tags, and isPinned props are passed to the NoteCard component based on the note data. The onEdit, onDelete, and onPinNote functions are passed as event handlers to the NoteCard component.
              //These functions are defined in the parent component (Home) and handle edit, delete, and pin actions for notes.
              <NoteCard
                key={item._id}
                title={item.title}
                content={item.content}
                date={
                  item.createdOn
                    ? moment(item.createdOn).format("MMM DD, YYYY")
                    : "Unknown Date"
                }
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? NoDataImg : AddNotesImg}
            message={
              isSearch
                ? `Ooops! No notes found matching your search.`
                : `Start creating your first note.`
            }
          />
          //Empty State: It renders an EmptyCard component, indicating that there are no notes to display.
          //imgSrc: The imgSrc prop need to be defined or passed in to show an image in the empty state.
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModal({ isShown: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        } // Close the modal
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-4 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
