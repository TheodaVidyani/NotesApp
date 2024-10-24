import React, { useEffect } from 'react'
import { LuCheck } from 'react-icons/lu'
import { MdDeleteOutline } from 'react-icons/md'

const Toast = ({isShown, message, type, onClose}) => {
// The Toast function is a React functional component that receives props destructured into four variables: isShown, message, type, and onClose.
//Functional Components in React are JavaScript functions that return React elements. They are one of the two main types of components in React, the other being class components. Functional components are typically simpler and more concise, making them easier to read and test.
//Hooks: With the introduction of React Hooks, functional components can manage state and side effects, making them more powerful and capable of handling complex logic.

//Props (short for "properties") are a way to pass data from one component to another in React. They allow components to communicate with each other and are used to customize a component's behavior and appearance.

//How Props Work: When you create a component, you can pass props to it, which are then accessible inside the component. For example:

//              const Greeting = (props) => {
//              return <h1>Hello, {props.name}!</h1>;
//              };

//              // Usage
//              <Greeting name="Alice" />


//In this case, the Greeting component receives a prop called name and uses it to display a personalized greeting.

//Destructuring Props

//Destructuring is a JavaScript feature that allows you to extract properties from objects and assign them to variables. In React, destructuring props helps simplify your code and makes it cleaner and more readable.

useEffect(() => {
    const timeoutId = setTimeout (() => {
        onClose();
    }, 3000);

    return () => {
        clearTimeout(timeoutId);
    };
}, [onClose]
);

  return (
    <div className={`absolute top-20 right-6 transition-all duration-400 ${
        !isShown ? 'opacity-100' : 'opacity-0'
    }` }>
        {/* This div is positioned absolutely on the page:

    absolute: Positions the element relative to its nearest positioned ancestor.
    top-20 and right-6: Positions it 20 units from the top and 6 units from the right of its parent.
    transition-all duration-400: Applies a transition effect that lasts for 400 milliseconds to any changes in properties like opacity or position.
    opacity-100 or opacity-0: Uses a ternary operator (!isShown ? 'opacity-100' : 'opacity-0') to control the visibility of the component. If !isShown is true, it will be fully visible; if false, it will be invisible (opacity of 0).
    
    The dollar sign ($) and backticks (`) are part of a JavaScript feature called template literals (or template strings).
    
    Template Literals

    Backticks (``):
        Backticks are used to create template literals in JavaScript. They allow you to create multi-line strings and embed expressions inside the string.

    Dollar Sign with Curly Braces (${}):
        The ${} syntax is used within a template literal to embed expressions. The expression inside the curly braces is evaluated, and the result is inserted into the string.
         
         
         Static Part: The part before ${} (absolute top-20 right-6 transition-all duration-400) is a static string that contains CSS class names.
         Dynamic Part: The expression inside ${} (isShown ? 'opacity-100' : 'opacity-0') is a ternary operator
        */}
        <div className={`min-w-52 bg-white rounded-md border shadow-2xl after:w-[5px] after:h-full${
            type === "delete"? "after:bg-red-500" : "after:bg-green-500"
            } after:absolute after:left-0 after top-0 after:rounded-l-lg`}>
                {/* This div represents the notification box:

    min-w-52: Sets a minimum width for the box.
    bg-white: Gives the box a white background.
    rounded-md: Applies medium border-radius for rounded corners.
    border: Adds a border to the box.
    shadow-2xl: Applies a large shadow for depth.
    The after: pseudo-element styles are used to add a vertical bar on the left:
        after:w-[5px] and after:h-full: Sets the width to 5 pixels and height to fill the parent.
        after:bg-red-500 or after:bg-green-500: Based on the value of type, it sets the color of the vertical bar to red if the type is "delete" or green otherwise.
        after:absolute after:left-0 after:top-0 after:rounded-l-lg: Positions the bar absolutely on the left side and rounds its left corners. */}
      <div className="flex items-center gap-3 py-2 px-4">
        {/* items-center: Centers the items vertically.
            gap-3: Adds space between items. */}
        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
            type === "delete" ? "bg-red-50" : "bg-green-50"
        }`}>
            { type === "delete" ? ( <MdDeleteOutline className="text-xl text-red-500"/> 
            ):( <LuCheck className="text-xl text-green-500" />
            )}

        </div>
        < p className='text-sm text-slate-800'>{message}</p>
    </div>
    </div>
    </div>
  )
}

export default Toast
