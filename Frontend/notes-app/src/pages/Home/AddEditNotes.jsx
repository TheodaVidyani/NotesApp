import React, { useState } from 'react';
import TagInput from '../../components/Input/TagInput';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosinstance';

const AddEditNotes = ({ noteData, type, getAllNotes, onClose, showToastMessage }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);

  // Add note
  //The addNewNote function in my frontend code connects to the backend API via an HTTP POST request.
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post('/add-note', {
        title,
        content,
        tags,
      });
      //This line sends an HTTP POST request to the backend endpoint /add-note.
      //Payload: It includes title, content, and tags in the request body, as JSON data. The backend will access these through req.body.title, req.body.content, and req.body.tags.
      console.log("API Response:", response.data); // Log the full response from the API

      if (response.data && response.data.note) {
        showToastMessage("Note Added Successfully.");
        console.log("Note added successfully:", response.data.note); // Log the added note details
        getAllNotes();
        console.log("Notes refreshed after adding new note."); // Confirm that notes were refreshed
        onClose(); // Close the note form/modal   
      }
    } catch (error) {
      console.error("Error adding note:", error); // Log the error if the API call fails
      if (error.response && error.response.data && error.response.data.message) {
        console.error("Error message from server:", error.response.data.message); // Log specific error message from the server
        setError(error.response.data.message);
      }
    }
  };

  // Edit note
  const editNote = async () => {
    // Implement edit functionality here
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put('/edit-note/' + noteId, {
        title,
        content,
        tags,
      });
      if (response.data && response.data.message) {
        showToastMessage("Note Updated Successfully.");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
    }
  };


  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title.");
      return;
    }
    if (!content) {
      setError("Please enter the content.");
      return;
    }
    setError(null);

    if (type === "edit") {
      editNote(); // Call edit function
    } else {
      addNewNote(); // Call add function
    }
  };

  return (
    <div className="relative">
      <button className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-500" onClick={onClose}>
        <MdClose className="text-xl text-slate-400" />
      </button>

      <div className="flex flex-col gap-2">
        <label className="input-label">Title</label>
        <input
          type="text"
          className="text-sm  text-slate-950 outline-none"
          placeholder="Required*"
          value={title}
          onChange={({ target }) => setTitle(target.value)} // Changed onClick to onChange
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">Content</label>
        <textarea
          className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
          placeholder="Required*"
          rows={10}
          value={content}
          onChange={({ target }) => setContent(target.value)} // Changed onClick to onChange
        />
      </div>
      <div className="mt-3">
        <label className="input-label">Tags</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button className="btn-primary font-medium mt-5 p-3" onClick={handleAddNote}>
        {type === 'edit' ? 'UPDATE' : 'ADD'}
      </button>
    </div>
  );
};

export default AddEditNotes;
