import React from "react";
import {MdOutlinePushPin, MdCreate, MdDelete} from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onDelete,
  onEdit,
  onPinNote,
}) => {
  return (
    <div className="border rounded p-8 bg-white hover:shadow-xl transition-all ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium">
            {moment(date).format("MMM DD, YYYY")}
          </h6>
          {/* moment is a JavaScript library used to format, manipulate, and display dates and times.
              In this code, moment(date) takes a date object and formats it into a readable string with the format "MMM DD, YYYY". */}
          <span className="text-sm text-slate-500">{date}</span>
          {/* This displays the raw date value inside a <span> element. The class text-sm makes the text small, and text-slate-500 applies a specific color (from a color utility framework like Tailwind CSS). */}
        </div>
        <MdOutlinePushPin
          className={`icon-btn ${isPinned ? "text-primary" : "text-slate-300"}`}
          // This is rendering an icon (MdOutlinePushPin from Material Design icons), which represents a "push pin."
          // The className uses a conditional class:

          // If isPinned is true, it will add the class "text-primary" (which likely styles the icon with a primary color).
          // If isPinned is false, it will add the class "text-slate-300" (which probably styles the icon with a grayish color).

          // onClick={onPinNote} sets up an event handler that will call the onPinNote function when the icon is clicked.
          onClick={onPinNote}
        />
      </div>
      <p className="text-xs text-slate-600 mt-2">{content?.slice(0, 60)}</p>
      {/* mt-2 adds a top margin (spacing).
          content?.slice(0, 60) ensures that only the first 60 characters of the content string are displayed. The ?. is optional chaining, which means if content is undefined or null, it won't throw an error, but will gracefully handle it. */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500">
          {tags.map((item) => `#${item}`)}
          {/* tags.map((item)=>\#${item}`)is iterating over an array calledtags and for each tag (item), it prepends a #` to it.
              For example, if tags = ['coding', 'react'], the output will be #coding #react. */}
        </div>
        {/* What is meant by the above code is,   */}
        <div className="flex items-center gap-2">
          <MdCreate
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover:text-red-600"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
